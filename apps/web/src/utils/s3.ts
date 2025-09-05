export const uploadFileToStorage = async (presignedUrl: string, file: File) => {
  const headers = new Headers({
    "Content-Type": file.type,
  });

  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: headers,
    body: file,
  });

  return response.status;
};

export const convertStringToFile = (
  data: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([data], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};
