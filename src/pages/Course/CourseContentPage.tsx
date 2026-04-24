import CourseContentMenu from '../../components/Course/CourseContentMenu'
import { CourseService } from '../../api/courseService';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SafeHTML from '../../components/Utilities/SafeHTML';
import { EnrollmentService } from '../../api/enrollmentService';
import { useContext } from 'react';
import { UserContext } from '../../contexts/userContext';
import CourseVideoPlayer from '@/components/Utilities/CourseVideoPlayer';

type Lecture = {
  content: string;
  videoUrl: string;
  name: string;
  id: number;
};


function CourseContentPage() {
  const [courseSections, setCourseSections] = useState([]);
  const { id } = useParams();
  const courseId = Number(id); // now it's a number
  const [moduleContent,setModuleContent] = useState<Lecture>({ content: '', videoUrl: '', name: '', id: 0 });
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const videoUrl = moduleContent.videoUrl;
  const content = moduleContent.content;
  const contentName = moduleContent.name;
  const [enrollment,setEnrollment] = useState<any>({});
  const [completedModuleContents,setcompletedModuleContents] = useState<any>([]);
  const navigate = useNavigate();

  const user = useContext(UserContext);

  useEffect(() => {
    if (moduleContent.name) {
      setIsLectureModalOpen(true);
    }
  }, [moduleContent.id]);

  async function handleMarkCourse (moduleContentId:number) {
    if(!user.user || !enrollment?.id){
      console.log(enrollment);
      return;
    }
    if(completedModuleContents.includes(moduleContentId)) return;
    await EnrollmentService.createEnrollmentProgress({enrollmentId: enrollment.id,moduleContentId:moduleContentId });
    setcompletedModuleContents([...completedModuleContents,moduleContentId]); 
  }

  async function GetEnrollment () {
    if(!user.user){
      return ;
    }
    const enrollment = await EnrollmentService.GetEnrollmentByCourseIdAndStudentId(courseId);
    setEnrollment(enrollment);
    setcompletedModuleContents(enrollment.enrollmentProgress.map((x: { moduleContentId: number }) => x.moduleContentId));
  }

  useEffect(() => {
  if(!user.user) navigate('/');
  GetEnrollment();
  CourseService.getCourseModulesByCourseId(courseId)
    .then(response => {
      setCourseSections(response); // Ensure sections is an array
    })
    .catch(error => {
      console.error('Error fetching course sections:', error);
      return []; // Return an empty array or handle the error as needed
    });
  }, [courseId]);


  return (
    <div>
      {/* {!user.user && navigate('/')} */}
      <div className='container sm:grid sm:grid-cols-[2fr_8fr] gap-10 p-2'>
        <aside>
          <CourseContentMenu CourseModules={courseSections} setModuleContent={setModuleContent}
          completedModuleContents={completedModuleContents}/>
        </aside>

        <main className='mt-10 sm:mt-0'>
          <h2 className='text-4xl font-medium mb-6'>{contentName}</h2>
          {videoUrl && <CourseVideoPlayer videoUrl={videoUrl} />}

        <article className={videoUrl && 'mt-10 w-full' }>
          <SafeHTML html = {content}></SafeHTML>
        </article>

          {moduleContent.name && (
            <div className={`mt-6 inline-block cursor-pointer px-4 py-4 bg-primary
           text-white rounded-[4px] hover:bg-primary/90 transition font-semibold`} 
           onClick={() => handleMarkCourse(moduleContent.id)}>Mark as completed</div>
          )}

          {isLectureModalOpen && moduleContent.name && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={() => setIsLectureModalOpen(false)}>
              <div
                className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => setIsLectureModalOpen(false)}
                  className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Close
                </button>

                <div className="pr-16">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Lecture preview</p>
                  <h3 className="mt-2 text-3xl font-semibold text-gray-900">{contentName}</h3>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                  <div className="order-2 lg:order-1">
                    <h4 className="mb-3 text-lg font-semibold text-gray-900">Instructions / Description</h4>
                    <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <SafeHTML html={content} />
                    </article>
                  </div>

                  <div className="order-1 lg:order-2">
                    <h4 className="mb-3 text-lg font-semibold text-gray-900">Video</h4>
                    {videoUrl ? (
                      <CourseVideoPlayer videoUrl={videoUrl} />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                        No lecture video is attached to this content yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          

        </main>
      </div>

    </div>
  )
}

export default CourseContentPage