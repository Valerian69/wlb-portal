/**
 * Clients API Routes
 * Handles company/organization management (Super Admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { verifyAccessToken, extractBearerToken } from '@/lib/server/middleware/auth';
import { generateEncryptionKey, generateIV, encrypt } from '@/lib/server/crypto/encryption';
import { requireRole } from '@/lib/server/middleware/rbac';



/**
 * GET /api/clients
 * List all clients (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication - Super Admin only
    const authResult = await requireRole('SUPER_ADMIN')(request);
    
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive');

    let whereClause: Record<string, unknown> = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client (Super Admin only)
 * Body: { name, slug, primaryColor? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication - Super Admin only
    const authResult = await requireRole('SUPER_ADMIN')(request);
    
    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, primaryColor } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingClient = await prisma.client.findUnique({ where: { slug } });
    if (existingClient) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // Generate encryption keys for this client's data
    const encryptionKey = generateEncryptionKey();
    const encryptionIv = generateIV();

    // Create client
    const client = await prisma.client.create({
      data: {
        name,
        slug,
        primaryColor: primaryColor || '#3b82f6',
        isActive: true,
        encryptionKey,
        encryptionIv,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CLIENT',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'Client',
        targetId: client.id,
        metadata: { name, slug },
      },
    });

    return NextResponse.json({
      success: true,
      data: client,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/:id
 * Update a client (Super Admin only)
 * Body: { name?, slug?, primaryColor?, isActive? }
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication - Super Admin only
    const authResult = await requireRole('SUPER_ADMIN')(request);
    
    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.pathname.split('/').pop();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, primaryColor, isActive } = body;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({ where: { id: clientId } });
    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== existingClient.slug) {
      const slugExists = await prisma.client.findUnique({ where: { slug } });
      if (slugExists && slugExists.id !== clientId) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update client
    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CLIENT',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'Client',
        targetId: clientId,
        metadata: { changes: body },
      },
    });

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/:id
 * Delete/deactivate a client (Super Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication - Super Admin only
    const authResult = await requireRole('SUPER_ADMIN')(request);
    
    if (!authResult.authorized || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.pathname.split('/').pop();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        _count: {
          select: {
            users: true,
            reports: true,
          },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has active users or reports
    if (existingClient._count.users > 0 || existingClient._count.reports > 0) {
      // Soft deactivate instead of hard delete
      await prisma.client.update({
        where: { id: clientId },
        data: { isActive: false },
      });

      // Deactivate all users for this client
      await prisma.user.updateMany({
        where: { clientId },
        data: { status: 'INACTIVE' },
      });

      // Log audit event
      await prisma.auditLog.create({
        data: {
          action: 'DEACTIVATE_CLIENT',
          status: 'SUCCESS',
          userId: authResult.payload.userId,
          userEmail: authResult.payload.email,
          targetType: 'Client',
          targetId: clientId,
          metadata: {
            reason: 'Client had active data - soft deactivated',
            userCount: existingClient._count.users,
            reportCount: existingClient._count.reports,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Client deactivated (has existing data)',
        data: { deactivated: true, reason: 'Has existing users or reports' },
      });
    }

    // Hard delete if no data
    await prisma.client.delete({ where: { id: clientId } });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_CLIENT',
        status: 'SUCCESS',
        userId: authResult.payload.userId,
        userEmail: authResult.payload.email,
        targetType: 'Client',
        targetId: clientId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
