/**
 * Users API Routes
 * Handles user management with RBAC and client scoping
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '@/lib/server/crypto/password';
import { verifyAccessToken, extractBearerToken } from '@/lib/server/middleware/auth';
import { requirePermission, requireClientAccess } from '@/lib/server/middleware/rbac';



/**
 * GET /api/users
 * List users (with RBAC filtering)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and client scope
    const authResult = await requireClientAccess(
      'SUPER_ADMIN',
      'COMPANY_ADMIN'
    )(request);

    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');

    // Build query
    let whereClause: Record<string, unknown> = {};

    // Client scoping
    if (authResult.payload.role === 'COMPANY_ADMIN') {
      if (!authResult.clientId) {
        return NextResponse.json({ error: 'No client association' }, { status: 403 });
      }
      whereClause.clientId = authResult.clientId;
    } else if (authResult.payload.role === 'SUPER_ADMIN') {
      // Super admins can filter by client
      const clientId = url.searchParams.get('clientId');
      if (clientId) {
        whereClause.clientId = clientId;
      }
    }

    // Additional filters
    if (status) {
      whereClause.status = status as UserStatus;
    }
    if (role && authResult.payload.role === 'SUPER_ADMIN') {
      whereClause.role = role as UserRole;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clientId: true,
        lastLoginAt: true,
        createdAt: true,
        client: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (Company Admins can only create for their client)
 * Body: { email, password, name, role, clientId? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const authResult = await requireClientAccess(
      'SUPER_ADMIN',
      'COMPANY_ADMIN'
    )(request);

    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role, clientId } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role based on creator's role
    const creatorRole = authResult.payload.role;
    const allowedRoles: UserRole[] = creatorRole === 'SUPER_ADMIN'
      ? ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EXTERNAL_ADMIN', 'INTERNAL_ADMIN']
      : ['INTERNAL_ADMIN']; // Company admins can only create internal admins

    if (!allowedRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Cannot create user with role: ${role}` },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Determine client ID
    let targetClientId = clientId;
    if (creatorRole === 'COMPANY_ADMIN') {
      // Company admins must create users for their own client
      targetClientId = authResult.payload.clientId;
      if (!targetClientId) {
        return NextResponse.json(
          { error: 'Company admin not associated with any client' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role as UserRole,
        clientId: targetClientId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clientId: true,
        createdAt: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'User',
        targetId: user.id,
        clientId: targetClientId,
        metadata: { createdEmail: email, createdRole: role },
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/:id
 * Update a user
 * Body: { name?, email?, role?, status? }
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireClientAccess(
      'SUPER_ADMIN',
      'COMPANY_ADMIN'
    )(request);

    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, role, status } = body;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check client scoping
    if (authResult.payload.role === 'COMPANY_ADMIN') {
      if (existingUser.clientId !== authResult.payload.clientId) {
        return NextResponse.json(
          { error: 'Cannot modify user from another client' },
          { status: 403 }
        );
      }
      // Company admins cannot change roles to COMPANY_ADMIN or SUPER_ADMIN
      if (role && ['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return NextResponse.json(
          { error: 'Cannot elevate user to this role' },
          { status: 403 }
        );
      }
    }

    // Super admins cannot be modified by company admins
    if (existingUser.role === 'SUPER_ADMIN' && authResult.payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify super admin users' },
        { status: 403 }
      );
    }

    // Update user
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && authResult.payload.role === 'SUPER_ADMIN') {
      updateData.role = role;
    }
    if (status) {
      updateData.status = status;
      if (status === 'SUSPENDED' || status === 'INACTIVE') {
        // Clear refresh tokens on suspension
        await prisma.userSession.deleteMany({ where: { userId } });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        clientId: true,
        updatedAt: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'User',
        targetId: userId,
        clientId: existingUser.clientId,
        metadata: { changes: body },
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireClientAccess(
      'SUPER_ADMIN',
      'COMPANY_ADMIN'
    )(request);

    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Cannot delete yourself
    if (userId === authResult.payload.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check client scoping
    if (authResult.payload.role === 'COMPANY_ADMIN') {
      if (existingUser.clientId !== authResult.payload.clientId) {
        return NextResponse.json(
          { error: 'Cannot delete user from another client' },
          { status: 403 }
        );
      }
    }

    // Cannot delete super admins (unless you're a super admin)
    if (existingUser.role === 'SUPER_ADMIN' && authResult.payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete super admin users' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to INACTIVE
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });

    // Delete all sessions
    await prisma.userSession.deleteMany({ where: { userId } });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_USER',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'User',
        targetId: userId,
        clientId: existingUser.clientId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
