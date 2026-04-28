import { useEffect, useState } from 'react';

interface ModuleContent {
  id: number;
  name: string;
  content: string;
  videoUrl: string;
  attachments?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    contentType: string;
    attachmentType: string;
  }>;
}

interface CourseModule {
  id: number;
  name: string;
  moduleContents: ModuleContent[];
}

interface CourseContentMenuProps {
  CourseModules: CourseModule[];
  completedModuleContents: number[];
  setModuleContent: React.Dispatch<React.SetStateAction<{ content: string; videoUrl: string; name: string ;id:number; attachments?: ModuleContent['attachments']}>>;
}

export default function CourseContentMenu({
  CourseModules,
  completedModuleContents,
  setModuleContent
}: CourseContentMenuProps) {
  const [expandedCourseModules, setExpandedCourseModules] = useState<number[]>([]);
  const [activeModuleContentID, setActiveModuleContentID] = useState<number>();

  useEffect(() => {
    const moduleContents = CourseModules.flatMap(courseModule => courseModule.moduleContents);
    const oldCompletedModuleContentId = completedModuleContents[completedModuleContents.length -1];
    if(oldCompletedModuleContentId===undefined || oldCompletedModuleContentId == -1) return; 
        
    const currentIndex = moduleContents.findIndex(content => content.id === oldCompletedModuleContentId);
    const newContentModule = currentIndex >= 0 && currentIndex + 1 < moduleContents.length
      ? moduleContents[currentIndex + 1]
      : undefined;
    if(newContentModule === undefined) return;
    onModuleContentClickHandler(newContentModule);
  },[completedModuleContents])
  

  const onModuleContentClickHandler = (moduleContent: ModuleContent) => {
    setActiveModuleContentID(moduleContent.id);
    setModuleContent({
      content: moduleContent.content,
      videoUrl: moduleContent.videoUrl,
      name: moduleContent.name,
      id: moduleContent.id,
      attachments: moduleContent.attachments
    });
  };

  const toggleCourseModule = (id: number) => {
    setExpandedCourseModules(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-md p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Course Content</h2>
      <ul className="space-y-2">
        {CourseModules.map(CourseModule => (
          <li key={CourseModule.id}>
            <button
              className="w-full flex justify-between items-center text-left font-medium text-gray-700 hover:text-primary"
              onClick={() => toggleCourseModule(CourseModule.id)}
            >
              {CourseModule.name}
              <span>{expandedCourseModules.includes(CourseModule.id) ? '−' : '+'}</span>
            </button>

            {expandedCourseModules.includes(CourseModule.id) && (
              <ul className="mt-2 pl-4 border-l border-gray-300 space-y-1">
                {CourseModule.moduleContents.map(ModuleContent => {
                  const isCompleted = completedModuleContents.includes(ModuleContent.id);
                  return (
                    <li
                      key={ModuleContent.id}
                      className={`cursor-pointer p-2 rounded flex items-center gap-2 ${
                        ModuleContent.id === activeModuleContentID
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => onModuleContentClickHandler(ModuleContent)}
                    >
                      {/* Circle icon */}
                      <span
                        className={`w-4 h-4 flex items-center justify-center rounded-full border ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white text-[10px]'
                            : 'border-gray-400'
                        }`}
                      >
                        {isCompleted && '✓'}
                      </span>

                      {/* Content name */}
                      <span className="truncate">{ModuleContent.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
