import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  constructor(private readonly storage: Storage) {}

  async uploadHomeImage(file: File, sectionKey: string, slot: 'primary' | 'secondary'): Promise<string> {
    const extension = file.name.split('.').pop() ?? 'jpg';
    const filePath = `home-sections/${sectionKey}/${slot}-${Date.now()}.${extension}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
