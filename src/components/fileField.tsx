import { Upload } from "@mui/icons-material";

export function UploadFileButton({
  onUpload,
}: {
  className?: string;
  buttonClassName?: string;
  onUpload: (file: File[]) => void;
}) {
  const handleChange = (file: File[]) => {
    onUpload(file);
  };

  return (
    <label
      className="rounded-md bg-slate-300 px-2 hover:bg-slate-400/45"
      style={{ paddingTop: 6, paddingBottom: 6 }}
    >
      <Upload fontSize="small" />
      <input
        type="file"
        className="hidden"
        onChange={(e) => console.log(e.target.value)}
        onInput={(e) =>
          e.currentTarget.files &&
          handleChange(Array.from(e.currentTarget.files))
        }
      />
    </label>
  );
}
