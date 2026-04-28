import CourseContentMenu from '../../components/Course/CourseContentMenu'
import { CourseService } from '../../api/courseService';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SafeHTML from '../../components/Utilities/SafeHTML';
import { EnrollmentService } from '../../api/enrollmentService';
import { UserContext } from '../../contexts/userContext';
import CourseVideoPlayer from '@/components/Utilities/CourseVideoPlayer';
import { resolveMediaUrl } from '@/lib/mediaUrl';

type Lecture = {
  content: string;
  videoUrl: string;
  name: string;
  id: number;
  attachments?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    contentType: string;
    attachmentType: string;
  }>;
};


function CourseContentPage() {
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const { id } = useParams();
  const courseId = Number(id);
  const [moduleContent,setModuleContent] = useState<Lecture>({ content: '', videoUrl: '', name: '', id: 0 });
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const videoUrl = moduleContent.videoUrl;
  const content = moduleContent.content;
  const contentName = moduleContent.name;
  const [enrollment,setEnrollment] = useState<any>({});
  const [completedModuleContents,setcompletedModuleContents] = useState<number[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  const [markingContentId, setMarkingContentId] = useState<number | null>(null);
  const [markFeedback, setMarkFeedback] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = useContext(UserContext);

  useEffect(() => {
    if (moduleContent.name) {
      setIsLectureModalOpen(true);
    }
  }, [moduleContent.id]);

  async function handleMarkCourse (moduleContentId:number) {
    setMarkFeedback(null);

    if(!user.user || !enrollment?.id){
      setMarkFeedback('Course enrollment context is missing. Reload this page and try again.');
      return;
    }
    if(completedModuleContents.includes(moduleContentId)) {
      setMarkFeedback('This lecture is already marked as completed.');
      return;
    }

    try {
      setMarkingContentId(moduleContentId);
      await EnrollmentService.createEnrollmentProgress({enrollmentId: enrollment.id,moduleContentId:moduleContentId });
      setcompletedModuleContents((previous) => [...previous, moduleContentId]);
      setMarkFeedback('Progress saved successfully.');
    } catch (error: any) {
      setMarkFeedback(error?.message || 'Failed to save progress for this lecture.');
    } finally {
      setMarkingContentId(null);
    }
  }

  async function GetEnrollment () {
    if(!user.user){
      return ;
    }

    const enrollment = await EnrollmentService.GetEnrollmentByCourseIdAndStudentId(courseId);
    setEnrollment(enrollment);
    setcompletedModuleContents((enrollment?.enrollmentProgress || []).map((x: { moduleContentId: number }) => x.moduleContentId));
  }

  useEffect(() => {
    if(!user.user) {
      navigate('/');
      return;
    }

    const loadContext = async () => {
      setIsLoadingContext(true);
      setContextError(null);

      try {
        await GetEnrollment();
        const response = await CourseService.getCourseModulesByCourseId(courseId);
        setCourseSections(response || []);
      } catch (error: any) {
        setCourseSections([]);
        setContextError(error?.message || 'Failed to load course modules.');
      } finally {
        setIsLoadingContext(false);
      }
    };

    loadContext();
  }, [courseId, user.user, navigate]);


  return (
    <div>
      {/* {!user.user && navigate('/')} */}
      <div className='container sm:grid sm:grid-cols-[2fr_8fr] gap-10 p-2'>
        <aside>
          <CourseContentMenu CourseModules={courseSections} setModuleContent={setModuleContent}
          completedModuleContents={completedModuleContents}/>
        </aside>

        <main className='mt-10 sm:mt-0'>
          <h2 className='text-4xl font-medium mb-6'>{contentName || 'Choose a module to start learning'}</h2>

          {isLoadingContext && (
            <div className='mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
              Loading your learning content...
            </div>
          )}

          {contextError && (
            <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              {contextError}
            </div>
          )}

          {!isLoadingContext && !contextError && !moduleContent.name && (
            <div className='mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
              Select a lecture from the left panel to view video and reading instructions.
            </div>
          )}

          {videoUrl && <CourseVideoPlayer videoUrl={videoUrl} />}

        <article className={videoUrl ? 'mt-10 w-full' : '' }>
          <SafeHTML html = {content}></SafeHTML>
        </article>

          {moduleContent.name && (
            <button
              className={`mt-6 inline-block cursor-pointer px-4 py-4 bg-primary text-white rounded-[4px] hover:bg-primary/90 transition font-semibold disabled:cursor-not-allowed disabled:opacity-70`}
              onClick={() => handleMarkCourse(moduleContent.id)}
              disabled={markingContentId === moduleContent.id || completedModuleContents.includes(moduleContent.id)}
            >
              {completedModuleContents.includes(moduleContent.id)
                ? 'Completed'
                : markingContentId === moduleContent.id
                  ? 'Saving...'
                  : 'Mark as completed'}
            </button>
          )}

          {markFeedback && (
            <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${markFeedback.toLowerCase().includes('failed') || markFeedback.toLowerCase().includes('missing')
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}>
              {markFeedback}
            </div>
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

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="mb-3 text-lg font-semibold text-gray-900">Attachments</h4>
                      {moduleContent.attachments && moduleContent.attachments.length > 0 ? (
                        <div className="space-y-3">
                          {moduleContent.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={resolveMediaUrl(attachment.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">{attachment.fileName}</p>
                                <p className="text-xs text-slate-500">{attachment.attachmentType}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                Open in new tab
                              </span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                          No PDF or image attachments are available for this lecture.
                        </div>
                      )}
                    </div>
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