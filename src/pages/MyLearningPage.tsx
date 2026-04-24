import { useEffect, useState } from 'react';
import { EnrollmentService } from '../api/enrollmentService';
import { Link } from 'react-router-dom';
// import { useContext } from 'react';
// import { UserContext } from '../contexts/userContext';

function MyLearningPage() {
  const [isCompleted, setIsCompleted] = useState(false); // false = In Progress, true = Completed
  const [allCourses, setAllCourses] = useState<{ isCompleted: boolean }[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{ isCompleted: boolean }>>([]);
  // const studentId = useContext(UserContext).user?.id || 0;

  // ✅ Fetch once on component mount
  useEffect(() => {
    EnrollmentService.GetEnrolledCoursesByStudentId()
      .then((response) => {
        // console.log("Enrolled Courses:", response);
        setAllCourses(response);
      })
      .catch((error) => {
        console.error("Error fetching enrolled courses:", error);
      });
  }, []);

  // ✅ Filter when `isCompleted` or `allCourses` changes
  useEffect(() => {
    setEnrolledCourses(
      allCourses.filter((course) => course.isCompleted === isCompleted)
    );
  }, [isCompleted, allCourses]);

  // ✅ Toggle button handler
  const handleToggle = (isComp: boolean) => {
    setIsCompleted(isComp);
  };

  const tabClass = (active: boolean) =>
    `border border-accent border-solid p-1.5 rounded-3xl px-4 hover:bg-accent cursor-pointer ${
      active ? 'bg-accent text-white' : ''
    }`;

  return (
    <div className="container p-2">
      <h2 className="text-3xl font-semibold">My Learning</h2>

      {/* Toggle Buttons */}
      <div className="flex items-center gap-4 mt-4 text-[14px] font-medium">
        <div
          className={tabClass(!isCompleted)}
          onClick={() => handleToggle(false)}
        >
          In Progress
        </div>
        <div
          className={tabClass(isCompleted)}
          onClick={() => handleToggle(true)}
        >
          Completed
        </div>
      </div>

      {/* Courses */}
      <main className="mt-4">
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course: any) => (
            <Link key={course.courseID} to={`/course/${course.courseID}/content`} className='block sm:w-[60%]'>
                        <div
              className="border p-4 rounded-lg mb-2 shadow  hover:bg-hover cursor-pointer"
            >
              <div className="text-lg font-semibold">{course.courseTitle}</div>
              <div className="text-sm text-gray-500">
                {course.isCompleted ? 'Completed' : 'In Progress'}
              </div>
            </div>
            </Link>
          ))
        ) : (
          <div className="text-gray-500 mt-4">No courses found.</div>
        )}
      </main>

    </div>
  );
}

export default MyLearningPage;
