
export type CourseModule = {
    id:number | null;
    name: string;
    description: string;
    moduleContents: ModuleContent[] | null;
    //others
    moduleNumber:number;
    //Used to for deletion purposes
    tempId: string;
}

export type ModuleContent = {
    id: number;
    tempId:string;
    name: string;
    content: string | null;
    video: File | null;   
    courseModuleId: number | null;
    videoUrl: string | null;
    attachments?: ModuleContentAttachment[];
    imageFiles?: File[];
    pdfFiles?: File[];
    deleteAttachmentIds?: number[];
    contentNumber:number;
}

export type ModuleContentAttachment = {
    id: number;
    fileName: string;
    fileUrl: string;
    contentType: string;
    attachmentType: string;
}