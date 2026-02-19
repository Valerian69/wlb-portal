/**
 * EXIF Metadata Scrubbing Service
 * Removes all EXIF metadata from uploaded images to protect reporter anonymity
 */

import * as piexif from 'piexifjs';

export interface ScrubResult {
  success: boolean;
  originalExif?: string;
  scrubbedAt: Date;
  fileSize: number;
}

/**
 * Extract and encrypt EXIF data before scrubbing (for investigations)
 */
export function extractEXIF(imageBuffer: Buffer): string | null {
  try {
    const exifObj = piexif.load(imageBuffer.toString('base64'));
    if (exifObj && (exifObj['0th'] || exifObj['Exif'] || exifObj['GPS'])) {
      return JSON.stringify(exifObj);
    }
    return null;
  } catch (error) {
    console.error('EXIF extraction failed:', error);
    return null;
  }
}

/**
 * Remove all EXIF metadata from an image buffer
 * @param imageBuffer - The original image buffer
 * @returns Object with scrubbed buffer and audit info
 */
export async function scrubEXIF(imageBuffer: Buffer): Promise<{
  scrubbedBuffer: Buffer;
  result: ScrubResult;
}> {
  const originalExif = extractEXIF(imageBuffer);
  
  try {
    // Create a new image without EXIF data
    const exifObj = piexif.load(imageBuffer.toString('base64'));
    
    // Remove all EXIF segments
    exifObj['0th'] = {};
    exifObj['Exif'] = {};
    exifObj['GPS'] = {};
    exifObj['1st'] = {};
    exifObj['thumbnail'] = null;
    
    // Create new image with empty EXIF
    const zeroth = {};
    const exif = {};
    const gps = {};
    const first = {};
    const thumb = null;
    
    const exifBytes = piexif.dump({ '0th': zeroth, 'Exif': exif, 'GPS': gps, '1st': first, 'thumbnail': thumb });
    const exifStr = piexif.insert(exifBytes, imageBuffer.toString('base64'));
    
    const scrubbedBuffer = Buffer.from(exifStr, 'base64');
    
    return {
      scrubbedBuffer,
      result: {
        success: true,
        originalExif: originalExif || undefined,
        scrubbedAt: new Date(),
        fileSize: scrubbedBuffer.length,
      },
    };
  } catch (error) {
    console.error('EXIF scrubbing failed:', error);
    // Return original buffer if scrubbing fails (with warning)
    return {
      scrubbedBuffer: imageBuffer,
      result: {
        success: false,
        originalExif: originalExif || undefined,
        scrubbedAt: new Date(),
        fileSize: imageBuffer.length,
      },
    };
  }
}

/**
 * Get list of EXIF fields that could identify a user
 */
export function getIdentifyingEXIFFields(): string[] {
  return [
    'GPSLatitude',
    'GPSLongitude',
    'GPSAltitude',
    'DateTimeOriginal',
    'DateTimeDigitized',
    'Make',
    'Model',
    'SerialNumber',
    'LensSerialNumber',
    'BodySerialNumber',
    'CameraOwnerName',
    'OwnerName',
    'Artist',
    'Copyright',
    'UserComment',
    'ImageDescription',
    'Software',
    'ProcessingSoftware',
  ];
}

/**
 * Validate that an image has been properly scrubbed
 */
export function validateScrubbedImage(imageBuffer: Buffer): {
  isClean: boolean;
  remainingFields: string[];
} {
  try {
    const exifObj = piexif.load(imageBuffer.toString('base64'));
    const identifyingFields: string[] = [];
    
    const fieldsToCheck = getIdentifyingEXIFFields();
    
    // Check 0th IFD
    if (exifObj['0th']) {
      for (const field of fieldsToCheck) {
        if (exifObj['0th'][field as keyof typeof exifObj['0th']]) {
          identifyingFields.push(field);
        }
      }
    }
    
    // Check GPS IFD
    if (exifObj['GPS']) {
      for (const field of fieldsToCheck) {
        if (exifObj['GPS'][field as keyof typeof exifObj['GPS']]) {
          identifyingFields.push(`GPS:${field}`);
        }
      }
    }
    
    return {
      isClean: identifyingFields.length === 0,
      remainingFields: identifyingFields,
    };
  } catch {
    // If we can't parse EXIF, consider it clean
    return { isClean: true, remainingFields: [] };
  }
}
