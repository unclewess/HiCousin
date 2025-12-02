"use client";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";

interface ProofUploadButtonProps {
    onUploadComplete: (url: string) => void;
    onUploadError: (error: Error) => void;
}

export const ProofUploadButton = ({ onUploadComplete, onUploadError }: ProofUploadButtonProps) => {
    return (
        <UploadButton<OurFileRouter, "proofImage">
            endpoint="proofImage"
            onClientUploadComplete={(res) => {
                if (res && res[0]) {
                    onUploadComplete(res[0].url);
                    toast.success("Image uploaded successfully");
                }
            }}
            onUploadError={(error: Error) => {
                onUploadError(error);
                toast.error(`Upload failed: ${error.message}`);
            }}
            appearance={{
                button: "bg-cousin-purple text-white hover:bg-purple-700 ut-uploading:cursor-not-allowed",
                allowedContent: "text-gray-500 text-sm"
            }}
        />
    );
};
