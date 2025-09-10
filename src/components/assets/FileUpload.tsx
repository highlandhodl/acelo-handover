import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../hooks/auth/useAuth';
import { useUploadAsset } from '../../hooks/assets/useUploadAsset';

interface FileUploadProps {
  onUploadComplete: () => void;
  variant?: 'default' | 'gradient';
}

export default function FileUpload({ onUploadComplete, variant = 'default' }: FileUploadProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate: uploadAsset, isPending: uploading } = useUploadAsset();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 50MB',
        variant: 'destructive',
      });
      return;
    }

    uploadAsset(
      { name: file.name, file },
      {
        onSuccess: () => {
          toast({
            title: 'Upload successful',
            description: `${file.name} has been uploaded successfully`,
          });
          onUploadComplete();
          // Clear the input
          event.target.value = '';
        },
        onError: (error) => {
          console.error('Upload error:', error);
          toast({
            title: 'Upload failed',
            description: 'There was an error uploading your file',
            variant: 'destructive',
          });
          // Clear the input
          event.target.value = '';
        }
      }
    );
  };

  return (
    <div className="relative">
      <Input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="file-upload"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mov,.avi,.mp3,.wav,.m4a"
      />
      <Button
        asChild
        disabled={uploading}
        className={variant === 'gradient' 
          ? "bg-gradient-primary text-primary-foreground shadow-orange gap-2"
          : "gap-2"
        }
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Asset'}
        </label>
      </Button>
    </div>
  );
}