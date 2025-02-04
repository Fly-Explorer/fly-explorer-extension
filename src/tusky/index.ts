import fs from 'fs';
import { Upload } from 'tus-js-client';
import { Readable } from 'stream';
const tus_api="https://api.tusky.io"
const key="4a5c829c-bcd9-40eb-8687-c56dcb9a76db"

export async function uploadFile(
    file: File, 
    vaultId: string,
    onLoad: (percentage: number) => void,
    onSuccess: () => void,
    onError: () => void,

) {
    // const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: "application/json" });

    const upload = new Upload(file, {
        endpoint: `${tus_api}/uploads`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          'Api-Key': key,
        },
        metadata: {
            filename: file.name,
            filetype: file.type,
            vaultId: vaultId, // ID of the vault where the file will be stored
          },
        uploadSize: file.size,
        onError: (error) => {
            onError();
          console.error('Upload failed:', error.message);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          onLoad(Number(percentage));
          console.log(`Upload progress: ${percentage}%`);
        },
        onSuccess: () => {
            onSuccess();
          console.log('Upload finished:', upload.url);
        },
      });
       await upload.start();
}

// create vault to store files, Vaults in Tusky are secure storage containers for files.
export async function createVault(vaultName: string) {
    const response = await fetch(`${tus_api}/vaults`, {
        method: 'POST',
        headers: {
          'Api-Key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: vaultName,
        }),
      });
      
      const vault = await response.json();
      return vault;
}