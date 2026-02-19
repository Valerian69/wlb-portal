declare module 'piexifjs' {
  export interface ExifObject {
    '0th': Record<string, unknown>;
    'Exif': Record<string, unknown>;
    'GPS': Record<string, unknown>;
    '1st': Record<string, unknown>;
    'thumbnail': string | null;
  }

  export function load(base64Image: string): ExifObject;
  export function dump(exifObject: ExifObject): string;
  export function insert(exifBytes: string, base64Image: string): string;
  export function remove(base64Image: string): string;
}
