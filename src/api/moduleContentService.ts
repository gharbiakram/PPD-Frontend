import apiClient from "./apiClient";
import type { ModuleContent } from "@/types/CourseModule";

export const ModuleContentService = {
    
async createModuleContent(moduleContent: Partial< ModuleContent>) {
    try {
        const form = new FormData();
        form.append("moduleContentCreateDTO.Name", moduleContent.name || '');
        form.append("moduleContentCreateDTO.Content", moduleContent?.content?.toString() || "");
        form.append("moduleContentCreateDTO.CourseModuleID", moduleContent?.courseModuleId?.toString() || "0");

        if (moduleContent.video instanceof File) {
            form.append("videoFile", moduleContent.video);
        }

        moduleContent.imageFiles?.forEach((file) => form.append("imageFiles", file));
        moduleContent.pdfFiles?.forEach((file) => form.append("pdfFiles", file));

        console.log(moduleContent);
        const response = await apiClient.post("/moduleContent", form);
        return response.data;
    } catch (error) {
        console.error("Error creating module content:", error);
        throw error; // rethrow if you want calling code to handle it
    }
},


async updateModuleContent(moduleContent: Partial< ModuleContent> , deleteVideo:boolean) {
    try {
        const form = new FormData();

        // Match the .NET DTO: moduleContentDTOUpdate.ModuleContentUpdateDTO.*
        form.append("ModuleContentUpdateDTO.Id", moduleContent.id?.toString() || '');
        form.append("ModuleContentUpdateDTO.Name", moduleContent.name || '');
        form.append("ModuleContentUpdateDTO.Content", moduleContent?.content?.toString() || "");
        form.append("ModuleContentUpdateDTO.DeleteVideo", deleteVideo ? "true" : "false");

        // Append file only if a new one is selected
        if (moduleContent.video instanceof File) {
            form.append("videoFile", moduleContent.video);
        }

        moduleContent.imageFiles?.forEach((file) => form.append("imageFiles", file));
        moduleContent.pdfFiles?.forEach((file) => form.append("pdfFiles", file));
        moduleContent.deleteAttachmentIds?.forEach((id) => form.append("DeleteAttachmentIds", id.toString()));

        const response = await apiClient.put("/moduleContent", form);
        return response.data;
    } catch (error) {
        console.error("Error updating module content:", error);
        throw error;
    }
},


async deleteModuleContent(id: number) {
    try {
        const response = await apiClient.delete(`/moduleContent/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting module content with ID ${id}:`, error);
        throw error;
    }
}




}