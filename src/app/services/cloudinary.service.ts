import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private readonly cloudName = 'djldxjdtx';
  private readonly apiKey = '228141482397421';

  constructor(private readonly http: HttpClient) {}

  // Use unsigned upload preset for client-side upload; keep API secret on backend only.
  uploadImage(file: File, uploadPreset: string): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', this.apiKey);

    return this.http.post<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      formData
    );
  }
}
