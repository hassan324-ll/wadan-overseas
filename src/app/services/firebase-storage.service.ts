import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  private readonly injector = inject(EnvironmentInjector);

  constructor(private readonly storage: Storage) {}

  async uploadHomeImage(file: File, sectionKey: string, slot: 'primary' | 'secondary'): Promise<string> {
    const extension = file.name.split('.').pop() ?? 'jpg';
    const filePath = `home-sections/${sectionKey}/${slot}-${Date.now()}.${extension}`;
    return runInInjectionContext(this.injector, async () => {
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
  }

  async uploadNewsImage(file: File): Promise<string> {
    const extension = file.name.split('.').pop() ?? 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
    const filePath = `news/${Date.now()}-${baseName}.${extension}`;
    return runInInjectionContext(this.injector, async () => {
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
  }
}
