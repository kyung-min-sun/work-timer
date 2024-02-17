import { ButtonBase } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";
import { FolderOpenOutlined } from "@mui/icons-material";
import { twMerge } from "tailwind-merge";

export function FileField({
  className,
  buttonClassName,
  onUpload,
  prompt,
}: {
  className?: string;
  buttonClassName?: string;
  prompt?: string;
  onUpload: (file: File) => void;
}) {
  const handleChange = (file: File) => {
    onUpload(file);
  };

  return (
    <div
      className={`w-fit rounded-md border border-gray-300 focus:outline-none ${className}`}
    >
      <FileUploader
        handleChange={handleChange}
        name="file"
        hoverTitle=" "
        dropMessageStyle={{
          opacity: 0.2,
        }}
      >
        <ButtonBase
          className={twMerge(
            `flex w-full flex-row items-center gap-2 
            p-2 hover:bg-gray-200 focus:outline-none`,
            buttonClassName,
          )}
        >
          <FolderOpenOutlined />
          <span className="font-medium">{prompt ?? "Drag your file"}</span>
        </ButtonBase>
      </FileUploader>
    </div>
  );
}
