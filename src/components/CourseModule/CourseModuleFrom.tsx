import React, { useState } from 'react'
import type { CourseModule,ModuleContent } from '@/types/CourseModule';
import { Edit, Trash2,FileType  } from "lucide-react";
import ModuleContentForm from './ModuleContentForm';
import { Plus } from "lucide-react";
import { CourseModuleService } from '@/api/courseModuleService';
import type { Mode } from '../../types/Util'; 
import { helpers } from '@/Utilities/helpers';
import ConfirmDialog from '../Utilities/ConfirmDialog';


interface CourseModuleFormProps{
courseModule:CourseModule;
setCourseModules: React.Dispatch<React.SetStateAction<CourseModule[]>>;
courseID:number | null;
}


function CourseModuleFrom({courseModule,setCourseModules,courseID}:CourseModuleFormProps) {
    const [moduleEdit,setModuleEdit] = useState<boolean>(!courseModule.id);
    const courseId = courseID;
    const [ moduleName,setModuleName] = useState<string>(courseModule.name);
    const [ moduleDescription,setModuleDescription] = useState<string>(courseModule.description);
    const [courseModuleState,setCourseModuleState] = useState<CourseModule>(courseModule);
    let mode:Mode = (courseModuleState.id) ? 'update' : 'create';
    const [contents, setContents] = useState<ModuleContent[]>(courseModule.moduleContents || []);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const cancelDelete = () => {
        setShowConfirmDialog(false);
    };

    const confirmDelete = () => {
        handleRemoveModule(courseModule.moduleNumber);
        setShowConfirmDialog(false);
    };


    const handleAddLecture = () => {
        const newLecture: ModuleContent = {
            name: "",
            content: "<p></p>",
            tempId: helpers.generateUUID(), // to uniquely identify if no id exists
            courseModuleId: courseModuleState.id || null,
            id:0,
            video:null,
            videoUrl: '',
            contentNumber:0,
        };
        setContents(prev => [...prev, newLecture]);
    };

    const handleModuleEdit = () => {
        setModuleEdit(true);
    }

    async function handleSaveModule () { 
        if(mode === 'create'){
            const courseModuleId = await CourseModuleService.createCourseModule({courseId:courseId,name:moduleName,description:moduleDescription});
            console.log(courseModuleId);
            setCourseModuleState(prev => ({...prev,id: courseModuleId}));
        }else{
            CourseModuleService.updateCourseModule(courseModuleState.id || 0,{name:moduleName,description:moduleDescription});
        }
        handleModuleCancel();
    }

    const handleModuleCancel = () =>{
        setModuleEdit(false);
    }

    const handleRemoveModule = (moduleNumber: number) => {
        setCourseModules(prev => prev.filter(courseModule => courseModule.moduleNumber !== moduleNumber));
        if(courseModuleState.id === undefined) return;
        CourseModuleService.deleteCourseModule(courseModuleState.id || 0);
    }
    
  return (

    <div className='rounded-xl mt-2 bg-[#F3F5F7] p-6 border-1 border-solid border-[#bcbdbe]'>
        <ConfirmDialog
        open={showConfirmDialog}
        message={`Are you sure you want to delete module "${moduleName}"?`}
        onConfirm={confirmDelete} onCancel={cancelDelete} />
        {/* Course Module */}
        {!moduleEdit && (
            <div className='flex flex-wrap gap-2 items-start'>
                <p className='font-bold'>Module {courseModule.moduleNumber}:</p>
                <FileType className='h-5 w-5'/>
                <h3>{moduleName}</h3>
                <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleModuleEdit}>
                    <Edit className="w-5 h-5" />
                </button>

                <button className="text-red-600 hover:text-red-800 cursor-pointer"
                onClick={() => setShowConfirmDialog(true)}>
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        )}
        {moduleEdit && (
            <div className='p-2 border-[#b6b0ff] border-solid border-[1px] bg-white'>
                <div>

                    <form onSubmit={(e) =>{ e.preventDefault(); handleSaveModule()}}>
                    <div className="my-4">
                        <label htmlFor="module-name" className="block text-gray-700 font-medium mb-1">
                        Module Name
                        </label>
                        <input
                        type="text"
                        id="module-name"
                        className="w-full p-1 border-[#b6b0ff] border border-solid rounded-[5px]"
                        placeholder="Enter module name here"
                        value={moduleName}
                        required
                        onChange={(e) => {setModuleName(e.target.value);courseModule.name = e.target.value;}}
                        />
                    </div>

                    <div className="my-4">
                        <label htmlFor="module-description" className="block text-gray-700 font-medium mb-1">
                        Module Description
                        </label>
                        <textarea
                        id="module-description"
                        rows={3}
                        className="w-full p-1 border-[#b6b0ff] border border-solid rounded-[5px]"
                        placeholder="Enter module description here"
                        value={moduleDescription}
                        required
                        onChange={(e) => setModuleDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                        type="button"
                        className="font-semibold cursor-pointer hover:text-[#616060]"
                        onClick={handleModuleCancel}
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                        >
                        Save Module
                        </button>
                    </div>

                    </form>

                </div>
            </div>
        )}



        {/* Module Content */}
        <div className='ml-10 mt-4'>
            {contents.map((content, index) => {
                content.contentNumber = index +1;
                return(
                <ModuleContentForm
                    key={content.id || content.tempId}
                    courseModuleId={courseModuleState.id}
                    content={content}
                    setContents={setContents}
                />)
            })}

<button
  type="button"
  onClick={handleAddLecture}
  className="cursor-pointer border-1 border-solid border-[#bcbdbe] bg-white flex items-center gap-2 px-4 py-2 rounded-[4px] text-primary text-sm font-medium hover:bg-hover transition"
>
  <Plus className="w-4 h-4" />
  Add Lecture
</button>

        </div>

    </div>
  )
}

export default CourseModuleFrom