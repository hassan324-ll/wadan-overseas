import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly cloudName = 'djldxjdtx';
  private readonly apiKey = '129732896539371';
  private readonly newsUploadPreset = 'wadan-overseas';

  constructor(private readonly http: HttpClient) {}

  private uploadImage(file: File, uploadPreset: string, folder?: string): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', this.apiKey);
    if (folder) {
      formData.append('folder', folder);
    }

    return this.http.post<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      formData
    ).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          const cloudinaryMessage =
            typeof error.error?.error?.message === 'string'
              ? error.error.error.message
              : error.message;
          throw new Error(cloudinaryMessage);
        }

        throw error;
      })
    );
  }

  uploadNewsImage(file: File): Observable<string> {
    return this.uploadImage(file, this.newsUploadPreset, 'news').pipe(
      map((response) => response.secure_url)
    );
  }
}
