export const MAX_PATIENT_FILE_SIZE = 3 * 1024 * 1024;
export const MAX_PATIENT_FILES_PER_UPLOAD = 5;

export function getPatientFileSizeError(file, label = "الملف") {
  if (!file || file.size <= MAX_PATIENT_FILE_SIZE) return "";
  return `حجم ${label} يجب ألا يزيد عن 3 ميجابايت`;
}

export function validatePatientMedicalFiles(files) {
  const selectedFiles = Array.from(files || []);
  const oversizedFiles = selectedFiles.filter(
    (file) => Boolean(getPatientFileSizeError(file)),
  );
  const validFiles = selectedFiles.filter(
    (file) => !getPatientFileSizeError(file),
  );

  return {
    acceptedFiles: validFiles.slice(0, MAX_PATIENT_FILES_PER_UPLOAD),
    oversizedFiles,
    exceededCount: validFiles.length > MAX_PATIENT_FILES_PER_UPLOAD,
  };
}
