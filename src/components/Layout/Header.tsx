// import { useState, useRef, useEffect, useContext } from 'react';
// import Search from '../Utilities/Search';
// import { Bell, CircleUserRound, Globe } from 'lucide-react';
// import Navigation from './Navigation';
// import { Link, useNavigate } from 'react-router-dom';
// import { UserContext } from '@/contexts/userContext';
// import SignupLoginPage from '../../pages/SignLoginPage';



// function Header() {
//   const {user,setUser} = useContext(UserContext);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const [showSignupModal, setShowSignupModal] = useState(false);
//   const navigate = useNavigate();

//   const handleSignIn = () =>{
//     setShowSignupModal(true);
//   }

//   const handleCloseModal = () => {
//     setShowSignupModal(false);
//   };

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleLogout = () => {
//     // Add your logout logic here
//     console.log("Logging out...");
//     navigate("/");
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <div className='ml-20'>
//             {showSignupModal && (
//               <div
//                 className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
//                 onClick={handleCloseModal}
//               >
//                 <div
//                   className="h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <SignupLoginPage onClose={handleCloseModal} />
//                 </div>
//               </div>
//             )}

//       <div className='flex items-center p-3 text-[14px] justify-between'>
//         <div className='flex items-center gap-3 w-full'>
//           <Link to="/">
//             <div className='text-xl border-primary font-extrabold text-primary cursor-pointer'>
//               MINI COURSERA
//             </div>
//           </Link>
//           <div className='hidden explore p-2 pl-5 pr-5 border-1 border-primary hover:bg-hover rounded-[4px]
//             font-medium text-primary cursor-pointer md:block'>
//             Explore
//           </div>
//           <Search />
//         </div>
//         <div className='flex items-center gap-3 relative'>
//           <div className='hidden items-center text-accent hover:bg-hover cursor-pointer md:flex'>
//             <Globe className='p-2' size={38} />
//             <span className='pr-2'>English</span>
//           </div>

//           <Bell className='text-accent hover:bg-hover p-2 cursor-pointer' size={38} />

//           {/* Avatar with dropdown */}
//           <div className='relative' ref={dropdownRef}>
//             {user?.photoUrl ? (
//               <div
//                 className='text-accent hover:bg-hover p-2 cursor-pointer w-[38px]'
//                 onClick={() => setIsDropdownOpen(prev => !prev)}
//               >
//                 <img className='rounded-xl' src={user.photoUrl} alt="User" />
//               </div>
//             ) :(
//               <CircleUserRound
//                 className='text-accent hover:bg-hover p-2 cursor-pointer'
//                 size={38}
//                 onClick={() => setIsDropdownOpen(prev => !prev)}
//               />
//             )}

//             {isDropdownOpen && (
//               <div className='absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50'>
//                 {user ? (
//                   <>
//                     <Link to="/"className='block px-4 py-2 hover:bg-hover text-sm'>Home</Link>
//                     <Link to="/my-learning" className='block px-4 py-2 hover:bg-hover text-sm'>My Learning</Link>
//                     <Link to="/courses/InstructorCourses" className='block px-4 py-2 hover:bg-hover text-sm'>My Courses</Link>
//                     <button onClick={handleLogout} className='cursor-pointer w-full text-left px-4 py-2 hover:bg-hover text-sm'>
//                       Log Out</button>
//                   </>
//                 ) : (
//                     <button onClick={handleSignIn} className='cursor-pointer w-full text-left px-4 py-2 hover:bg-hover text-sm'>
//                       Sign In</button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Navigation />
//     </div>
//   );
// }

// export default Header;


import { useState, useRef, useEffect, useContext } from 'react';
import { Search as SearchIcon, Bell, CircleUserRound, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '@/contexts/userContext';
import SignupLoginPage from '../../pages/SignLoginPage';
import Navigation from './Navigation';
import NotificationsDropdown from './NotificationsDropdown';

function Header() {
  const { user, setUser } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isFocused, setIsFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isCourseDetail = location.pathname.startsWith('/course/');

  const handleSignIn = () => {
    setShowSignupModal(true);
  };

  const handleCloseModal = () => {
    setShowSignupModal(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/');
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <>
      {showSignupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <SignupLoginPage onClose={handleCloseModal} />
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-30 border-b-2 border-gray-100">
        {isCourseDetail ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group"
          >
            <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-colors">
              <ArrowLeft size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">Back</span>
          </button>
        ) : (
          <div className={`relative flex items-center transition-all duration-300 ease-in-out ml-20 ${isFocused ? 'w-full md:w-2/5' : 'w-full md:w-1/3'}`}>
            <div className="absolute left-4 text-gray-400">
              <SearchIcon size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search for courses, mentors..."
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 pl-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors group ${showNotifications ? 'bg-gray-50' : ''}`}
              >
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-yellow-400 border-2 border-white rounded-full group-hover:scale-110 transition-transform"></span>
              </button>
              {showNotifications && <NotificationsDropdown />}
            </div>

            <div className="relative" ref={dropdownRef}>
              {user?.photoUrl ? (
                <div
                  className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <img className="w-full h-full object-cover" src={user.photoUrl} alt="User" />
                </div>
              ) : (
                <CircleUserRound
                  className="text-gray-500 p-2 cursor-pointer rounded-full hover:bg-gray-50"
                  size={38}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                />
              )}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  {user ? (
                    <>
                      <Link to="/" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                        Home
                      </Link>
                      <Link to="/my-learning" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                        My Learning
                      </Link>
                      <Link to="/courses/InstructorCourses" className="block px-4 py-2 hover:bg-gray-50 text-sm">
                        My Courses
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Navigation />
    </>
  );
}

export default Header;
