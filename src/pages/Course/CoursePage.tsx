import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FAQs from '../../components/Utilities/FAQs';
import Modules from '../../components/CourseModule/Modules';
import { useFetchCourseById } from '../../hooks/useFetchCourseById';
import SignupLoginPage from '.././SignLoginPage';
import { useContext } from 'react';
import { UserContext } from '../../contexts/userContext';
import { EnrollmentService } from '../../api/enrollmentService';
import { CourseService } from '@/api/courseService';
import { useLocation } from "react-router-dom";


export default function CoursePage() {
  const { id } = useParams();
  const { course, isLoading, error } = useFetchCourseById(id);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user } = useContext(UserContext);
  const [enrollmentsCount , setEnrollmentsCount] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [enrollError, setEnrollError] = useState<string | null>(null);

    useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
 
  useEffect(() => {
    if (!course?.id) return;
    fetchEnrollmentsCount();
  }, [course?.id]);




  if (isLoading) return <div className="container py-10">Loading...</div>;
  if (error) return <div className="container py-10 text-red-500">{error}</div>;
  if (!course) return null;

  async function EnrollStudent() {
  setEnrollError(null); // Reset any previous error message
  const courseID = course.id;
  if (!user) return;
  try {
    const result = await EnrollmentService.GetEnrollmentByCourseIdAndStudentId(courseID);
    if (result) {
      navigate(`/course/${encodeURIComponent(courseID)}/content`);
    } else {
      await EnrollmentService.enrollStudent(courseID);
      navigate(`/course/${encodeURIComponent(courseID)}/content`);
    }
  } catch (err: any) {
    console.error("Enrollment failed:", err);
    if (err.response?.status === 403) {
      setEnrollError("Only students are allowed to enroll in this course.");
    } else {
      setEnrollError("An error occurred during enrollment. Please try again later.");
    }
  }
  };


  const handleEnroll = () => {
    if(!user){
      setShowSignupModal(true);
      return;
    }
    EnrollStudent();
  };

  const handleCloseModal = () => {
    setShowSignupModal(false);
  };

  async function fetchEnrollmentsCount () {
    try{
      const enrollmentsCount = await CourseService.getEnrollmentsCountByCourseId(course.id);
      setEnrollmentsCount(enrollmentsCount);
    }catch{
      throw new Error("Failed to fetch enrollments count");
    }
  }



  return (
      <div>

      {/* Modal Overlay */}
      {showSignupModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <SignupLoginPage onClose={handleCloseModal} />
          </div>
        </div>
      )}

      {/* Course Page Content */}
      <div className='bg-hover pb-10'>
        <div className='container py-10 px-4'>
                  {enrollError && (
          <p className="text-red-500 text-sm m-2 font-bold">
            {enrollError}
          </p>
      )}
          <div className='w-[80px]'>
            <img className='w-full' src={course.instructorImageUrl} alt="" />
          </div>
          <h2 className='text-3xl font-semibold mt-6'>{course.title}</h2>
          <p>This course is part of {course.category} category</p>
          <p className='text-[14px] my-2'>Instructor: {course.instructorName}</p>
          <button 
            className='bg-primary p-4 text-white text-[14px] rounded-[6px] mt-4 px-12 cursor-pointer font-medium hover:bg-[#0048B0]' 
            onClick={handleEnroll}
          >
            Enroll Now
          </button>
          <p className='text-[12px]'>
            <span className='font-bold'>{enrollmentsCount}</span> already enrolled
          </p>
        </div>
      </div>

      <div className='mb-30 p-2'>
        <div className='container relative'>
          <div className='flex flex-col md:flex-row gap-6 mt-10 md:absolute top-[-90px] border border-solid border-secondary bg-white rounded-lg w-full shadow-xl p-6 text-xl font-medium justify-around'>
            <div className='p-5'>{course.modules.length} modules</div>
            <div className='border-l-1 border-solid p-5 border-secondary'>{course.level} level</div>
            <div className='border-l-1 border-solid p-5 border-secondary'>Flexible schedule</div>
            <div className='border-l-1 border-solid p-5 border-secondary'>Taught in {course.language}</div>
            <div className='border-l-1 border-solid p-5 border-secondary'>Just for ${course.price}</div>
          </div>
        </div>
      </div>

      <div className='container mt-10 p-2'>
        <nav className='inline-block mb-10 sticky top-0 z-10 bg-white w-full'>
          <ul className='text-xl font-semibold text-secondary sm:flex gap-20 mt-10 border-b-1 border-solid pr-10 pb-4'>
            <li className='hover:text-primary cursor-pointer'><a href="#about">About</a></li>
            <li className='hover:text-primary cursor-pointer'><a href="#modules">Modules</a></li>
            <li className='hover:text-primary cursor-pointer'><a href="#FAQs">FAQs</a></li>
          </ul>
        </nav>

        <main className='content'>
          <section className='mb-20'>
            <h3 id='about' className='text-2xl font-medium mb-4 scroll-mt-36'>Description</h3>
            <div className='grid grid-cols-[2fr_1fr] gap-6'>
              <p>{course.description}</p>
              <div className='mt-6'>
                <img src={course.imageUrl} alt="" />
              </div>
            </div>
          </section>

          <section id='modules' className='scroll-mt-36'>
            <Modules modules={course.modules} />
          </section>

          <section id='FAQs' className='mt-20 scroll-mt-36'>
            <FAQs />
          </section>
        </main>
      </div>
    </div>
  );
}