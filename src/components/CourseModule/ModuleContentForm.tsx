import { useEffect, useState, useRef } from 'react';
import { Edit, Trash2, FileType, CircleCheck, Video, X } from "lucide-react";
import RichTextEditor from '../Utilities/RichTxtEditor';
import type { ModuleContent } from '@/types/CourseModule';
import { ModuleContentService } from '@/api/moduleContentService';
import { BeatLoader } from "react-spinners";
import type { Mode } from '@/types/Util';
import ConfirmDialog from "@/components/Utilities/ConfirmDialog"

interface ModuleContentFormProps {
  courseModuleId: number | null;
  content: Partial<ModuleContent>;
  setContents: React.Dispatch<React.SetStateAction<ModuleContent[]>>;
}


export default function ModuleContentForm({ courseModuleId,content = { name: "", content: "<p></p>" },setContents }: ModuleContentFormProps) {
  const [ContentEdit, setContentEdit] = useState<boolean>(!(content.id && content.id > 0));
  const [form, setForm] = useState<Partial<ModuleContent>>(content);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  let mode: Mode = form.id ? 'update' : 'create';

  useEffect(() => {
    setForm((prev) => ({ ...prev, courseModuleId }));
  }, [courseModuleId]);

  const handleContentModuleEdit = () => setContentEdit(true);

  const updateModuleContent = async () => {
    try {
      await ModuleContentService.updateModuleContent(form, deleteVideo);
      setContentEdit(false);
    } catch {
      setMessage("Failed to update lecture");
    }
  };

  const createModuleContent = async () => {
    try {
      const moduleContentId = await ModuleContentService.createModuleContent(form);
      setForm((prev) => ({ ...prev, id: moduleContentId }));
      setContentEdit(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveModuleContent = async (e:React.FormEvent) => {
    e.preventDefault();
    if (courseModuleId === undefined) {
      setMessage("You can't save the lecture because you haven't added a course module.");
      return;
    }

    setMessage("");
    setIsSaving(true);

    if (mode === 'update') await updateModuleContent();
    else await createModuleContent();

    setIsSaving(false);
    setDeleteVideo(false);
  };

  const handleModuleCancel = () => {
    setContentEdit(false);
    setDeleteVideo(false);
  };

  const handleVideoRemove = () => {
    setForm((prev) => ({ ...prev, video: null,videoUrl:null }));
    setSelectedVideoName(null);
    setDeleteVideo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, video: file }));
      setSelectedVideoName(file.name);
      setDeleteVideo(true);
    }
  };

  const handleDeleteModuleContent = async () => {
    setContents(prev => prev.filter(moduleContent => moduleContent.contentNumber !== content.contentNumber));
    if(form.id === undefined) return;
    try {
      setIsSaving(true);
      await ModuleContentService.deleteModuleContent(form.id);
      setForm({ name: "", content: "<p></p>",courseModuleId:courseModuleId });
      setContentEdit(false);
      setSelectedVideoName(null);
      setDeleteVideo(false);
    } catch (error) {
      setMessage("Error deleting module content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='my-2'>

        <ConfirmDialog
            open={showConfirmDelete}
            message="Are you sure you want to delete this lecture?"
            onConfirm={() => {
            handleDeleteModuleContent();
            setShowConfirmDelete(false);
            }}
            onCancel={() => setShowConfirmDelete(false)}
        />

      {isSaving && <BeatLoader color="#3498db" size={35} />}
      {message && <p className='text-red-600 font-bold my-2'>{message}</p>}

      {!ContentEdit && (
        <div className='mt-4 p-2 border-[#b6b0ff] border-solid border-[1px] bg-white flex flex-wrap gap-2 items-center'>
          <div className='flex flex-wrap gap-2 items-center'>
            <CircleCheck className='w-4 h-4' />
            <p className='font-semibold'>Lecture {content.contentNumber}:</p>
            <FileType className='h-4 w-4' />
            <h4>{form.name || "Untitled Lecture"}</h4>
            <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleContentModuleEdit}>
              <Edit className="w-4 h-4" />
            </button>
              <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => setShowConfirmDelete(true)}>
                <Trash2 className="w-4 h-4" />
              </button>
          </div>
        </div>
      )}

      {ContentEdit && (
        <div className='p-2 border-[#b6b0ff] border-solid border-[1px] bg-white'>
          <form onSubmit={handleSaveModuleContent}>
            <input
              type="text"
              className='w-full p-1 border-[#b6b0ff] border-solid border-[1px] rounded-[5px]'
              placeholder='Enter lecture title here'
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            <div className="my-2">
              <label className="block text-gray-700 font-medium">Lecture Content</label>
              <RichTextEditor
                value={form.content || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e }))}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label
                htmlFor="videoUpload"
                className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-400 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
              >
                <Video className="w-4 h-4" />
                Upload Video
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                id="videoUpload"
                className="hidden"
                onChange={handleVideoSelect}
              />

              {selectedVideoName || form.videoUrl ? (
                <div className="flex items-center gap-1 text-green-700 font-medium bg-green-100 px-2 py-1 rounded-md">
                  🎬 {selectedVideoName || "Current Video"}
                  <button type="button" onClick={handleVideoRemove}>
                    <X className="w-4 h-4 text-red-600 hover:text-red-800" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className='flex justify-end gap-4 mt-4'>
              <button
                className='font-semibold cursor-pointer hover:text-[#616060]'
                onClick={handleModuleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                Save Lecture
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
