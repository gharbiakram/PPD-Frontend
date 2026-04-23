// import { useState, useRef } from 'react';
// import type { ChangeEvent } from 'react';
// import {UserService} from '../api/userService';
// import { UserTypeEnum } from '../types/UserType';
// import { useContext } from 'react';
// import { UserContext } from '../contexts/userContext';

// interface FormData {
//   email: string;
//   password: string;
//   fullName: string;
//   profileImage: File | null;
//   userType: UserTypeEnum; // 1 = Student, 2 = Instructor
// }

// export default function SignupLoginPage({ onClose }: { onClose: () => void }) {

//   const { setUser } = useContext(UserContext);

//   function handleSignup () {
//     const firstNameData = formData.fullName.split(' ')[0];
//     const lastNameData = formData.fullName.split(' ').slice(1).join(' ') || '';
//     // Logic to handle course enrollment
//     UserService.create({
//       userType: formData.userType,
//       email: formData.email,
//       password: formData.password,
//       firstName: firstNameData,
//       lastName:lastNameData,
//       photo: formData.profileImage,
//     }).then(() => {
//         console.log('User created successfully');
//         setIsLogin(true);
//   })
//   }


// const handleLogin = () => {
//   UserService.getByEmailAndPassword(formData.email, formData.password)
//     .then(response => {
//       if (response) {
//         // console.log('Login successful');
//         setUser(response);
//         // Save in local storage
//         localStorage.setItem("user", JSON.stringify({
//           id: response.id,
//           firstName: response.firstName,
//           lastName: response.lastName,
//           email: response.email,
//           userType: response.userType,
//           photoUrl: response.photoUrl,
//           accessToken: response.token, // Save the access token
//         }));
//         onClose(); // Close the modal or redirect
//       }
//     })
//     .catch(error => {
//       // Handle login error
//       console.error('Login failed:', error);
//     });}


// const [isLogin, setIsLogin] = useState<boolean>(true);
// const [formData, setFormData] = useState<FormData>({
//   email: '',
//   password: '',
//   fullName: '',
//   profileImage: null,
//   userType: UserTypeEnum.Student, // default to Student
// });

//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setFormData(prev => ({ ...prev, profileImage: file }));

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if(!isLogin){
//       handleSignup();
//     }else{
//       handleLogin();
//     }
//     // Handle form submission
//   };

//   return (
//     <div className="">
//       <button
//         onClick={onClose}
//         className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
//       >
//         &times;
//       </button>

//       <div className="flex mb-6 border-b border-gray-200">
//         <button
//           className={`flex-1 py-2 font-medium ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
//           onClick={() => setIsLogin(true)}
//         >
//           Login
//         </button>
//         <button
//           className={`flex-1 py-2 font-medium ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
//           onClick={() => setIsLogin(false)}
//         >
//           Sign Up
//         </button>
//       </div>

//       {!isLogin && (
//         <div className="mb-4 flex flex-col items-center">
//           <div
//             onClick={triggerFileInput}
//             className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden mb-2"
//           >
//             {previewImage ? (
//               <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
//             ) : (
//               <span className="text-gray-400">+ Photo</span>
//             )}
//           </div>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleImageChange}
//             accept="image/*"
//             className="hidden"
//           />
//           <p className="text-xs text-gray-500">Click to upload profile photo</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {!isLogin && (
//           <div>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
//               placeholder="Enter your full name"
//               required={!isLogin}
//             />
//             <div>


//   <label className="ml-1 block text-sm font-medium text-gray-700 my-2">
//     I am a:
//   </label>
//   <div className="flex items-center space-x-6">
//     <label className="flex items-center space-x-2">
//       <input
//         type="radio"
//         name="userType"
//         value={UserTypeEnum.Student}
//         checked={formData.userType === UserTypeEnum.Student}
//         onChange={() => setFormData(prev => ({ ...prev, userType: UserTypeEnum.Student }))}
//         className="text-primary"
//       />
//           <span className="text-sm text-gray-700">Student</span>
//         </label>
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             name="userType"
//             value="2"
//             checked={formData.userType === UserTypeEnum.Instructor}
//             onChange={() => setFormData(prev => ({ ...prev, userType: UserTypeEnum.Instructor }))}
//             className="text-primary"
//           />
//           <span className="text-sm text-gray-700">Instructor</span>
//         </label>
//       </div>


//     </div>
//           </div>

//         )}

//         <div>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
//             placeholder="Enter your email (name@example.com)"
//             required
//           />
//         </div>

//         <div>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
//             placeholder={isLogin ? "Enter your password" : "Create a password (min 8 characters)"}
//             minLength={8}
//             required
//           />
//         </div>

//         {/* Remember me section & Forget Password*/}
//         {/* {isLogin && (
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                 Remember me
//               </label>
//             </div>
//             <div className="text-sm">
//               <a href="#" className="font-medium text-primary hover:text-primary-dark">
//                 Forgot password?
//               </a>
//             </div>
//           </div>
//         )} */}

//         <button
//           type="submit"
//           className="w-full bg-primary py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
//         >
//           {isLogin ? 'Log In' : 'Sign Up'}
//         </button>

//         {isLogin ? (
//           <p className="mt-3 text-center text-sm text-gray-600">
//             Don't have an account?{' '}
//             <button
//               type="button"
//               onClick={() => setIsLogin(false)}
//               className="font-medium text-primary hover:text-primary-dark"
//             >
//               Sign up
//             </button>
//           </p>
//         ) : (
//           <p className="mt-3 text-center text-sm text-gray-600">
//             Already have an account?{' '}
//             <button
//               type="button"
//               onClick={() => setIsLogin(true)}
//               className="font-medium text-primary hover:text-primary-dark"
//             >
//               Log in
//             </button>
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }




// //---------------------------_---------------------------_---------------------------_---------------------------_---------------------------_
// import { useState, useRef } from 'react';
// import type { ChangeEvent } from 'react';
// import {UserService} from '../api/userService';
// import { UserTypeEnum } from '../types/UserType';
// import { useContext } from 'react';
// import { UserContext } from '../contexts/userContext';
// import { Eye, EyeOff } from 'lucide-react';
// import logo from '../assets/landingPage/Logo_landing_page.png';
// import signInImage from '../assets/SignIn/Sign_in_img.png';
// import signUpImage from '../assets/SignIn/Sign_up_image.png';

// const FacebookIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

// const TwitterXIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M4 4L20 20M20 4L4 20" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
//   </svg>
// );

// const InstagramIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <rect x="2" y="2" width="20" height="20" rx="5" stroke="#555" strokeWidth="1.8"/>
//     <circle cx="12" cy="12" r="4" stroke="#555" strokeWidth="1.8"/>
//     <circle cx="17.5" cy="6.5" r="1" fill="#555"/>
//   </svg>
// );

// const LinkedInIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M6 9H2V21H6V9Z" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//     <circle cx="4" cy="4" r="2" stroke="#555" strokeWidth="1.8"/>
//   </svg>
// );

// const GoogleIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//   </svg>
// );

// interface FormData {
//   email: string;
//   password: string;
//   fullName: string;
//   profileImage: File | null;
//   userType: UserTypeEnum;
// }

// export default function SignupLoginPage({ onClose }: { onClose: () => void }) {
//   const { setUser } = useContext(UserContext);

//   function handleSignup() {
//     const firstNameData = formData.fullName.split(' ')[0];
//     const lastNameData = formData.fullName.split(' ').slice(1).join(' ') || '';
//     UserService.create({
//       userType: formData.userType,
//       email: formData.email,
//       password: formData.password,
//       firstName: firstNameData,
//       lastName: lastNameData,
//       photo: formData.profileImage,
//     }).then(() => {
//       console.log('User created successfully');
//       setIsLogin(true);
//     });
//   }

//   const handleLogin = () => {
//     UserService.getByEmailAndPassword(formData.email, formData.password)
//       .then(response => {
//         if (response) {
//           setUser(response);
//           localStorage.setItem("user", JSON.stringify({
//             id: response.id,
//             firstName: response.firstName,
//             lastName: response.lastName,
//             email: response.email,
//             userType: response.userType,
//             photoUrl: response.photoUrl,
//             accessToken: response.token,
//           }));
//           onClose();
//         }
//       })
//       .catch(error => {
//         console.error('Login failed:', error);
//       });
//   };

//   const [isLogin, setIsLogin] = useState<boolean>(true);
//   const [formData, setFormData] = useState<FormData>({
//     email: '',
//     password: '',
//     fullName: '',
//     profileImage: null,
//     userType: UserTypeEnum.Student,
//   });

//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setFormData(prev => ({ ...prev, profileImage: file }));
//       const reader = new FileReader();
//       reader.onloadend = () => { setPreviewImage(reader.result as string); };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     if (fileInputRef.current) { fileInputRef.current.click(); }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isLogin) {
//       handleSignup();
//     } else {
//       handleLogin();
//     }
//   };

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#fff' }}>

//       {isLogin ? (
//         <>
//           <div style={{ flex: '0 0 52%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', backgroundColor: '#fff', borderTopRightRadius: '28px', borderBottomRightRadius: '28px', boxShadow: '8px 0 40px rgba(0,0,0,0.10)', zIndex: 1 }}>
//             <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>

//               <div className="w-50 h-20">
//                 <img src={logo} alt="EduNova AI logo" />
//               </div>

//               <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#1a1a2e', marginBottom: '22px', marginTop: '4px', textAlign: 'center', letterSpacing: '-0.4px' }}>
//                 Login to your account
//               </h1>

//               <button
//                 type="button"
//                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '13px 20px', borderRadius: '10px', border: '1.5px solid #E0E0E0', backgroundColor: '#fff', cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '18px' }}
//                 onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5')}
//                 onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff')}
//               >
//                 <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>Login with Google</span>
//                 <GoogleIcon />
//               </button>

//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '18px' }}>
//                 <span style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0', display: 'block' }} />
//                 <span style={{ fontSize: '13px', color: '#999', flexShrink: 0 }}>Or</span>
//                 <span style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0', display: 'block' }} />
//               </div>

//               <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Email Address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email address"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E0E0E0', fontSize: '14px', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#fff' }}
//                     onFocus={e => (e.currentTarget.style.borderColor = '#6C3EF4')}
//                     onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
//                   />
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Password</label>
//                   <div style={{ position: 'relative', width: '100%' }}>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       placeholder="Enter your password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       minLength={8}
//                       style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: '10px', border: '1.5px solid #E0E0E0', fontSize: '14px', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#fff' }}
//                       onFocus={e => (e.currentTarget.style.borderColor = '#6C3EF4')}
//                       onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
//                     />
//                     <button
//                       type="button"
//                       style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
//                       onClick={() => setShowPassword(v => !v)}
//                     >
//                       {showPassword ? <Eye size={18} color="#999" /> : <EyeOff size={18} color="#999" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
//                   <a href="#" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>Forgot Password?</a>
//                 </div>

//                 <button
//                   type="submit"
//                   style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#1a1a2e', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '4px', letterSpacing: '0.2px' }}
//                   onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3a2ad4')}
//                   onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a2e')}
//                 >
//                   Log In
//                 </button>
//               </form>

//               <p style={{ fontSize: '13px', color: '#666', marginTop: '16px', textAlign: 'center' }}>
//                 Don't have an account?{' '}
//                 <button type="button" onClick={() => setIsLogin(false)} style={{ color: '#1a1a2e', fontWeight: 700, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
//                   Sign up
//                 </button>
//               </p>

//               <div style={{ display: 'flex', gap: '18px', marginTop: '22px', alignItems: 'center', justifyContent: 'center' }}>
//                 <a href="#" aria-label="Facebook" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><FacebookIcon /></a>
//                 <a href="#" aria-label="X / Twitter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><TwitterXIcon /></a>
//                 <a href="#" aria-label="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><InstagramIcon /></a>
//                 <a href="#" aria-label="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><LinkedInIcon /></a>
//               </div>

//             </div>
//           </div>

//           <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'stretch', backgroundColor: '#000' }}>
//             <img src={signInImage} alt="Login visual" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
//           </div>
//         </>
//       ) : (
//         <>
//           <div style={{ flex: '0 0 48%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
//             <img src={signUpImage} alt="Sign up visual" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
//           </div>

//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', backgroundColor: '#fff', borderTopLeftRadius: '28px', borderBottomLeftRadius: '28px', boxShadow: '-8px 0 40px rgba(0,0,0,0.06)', marginLeft: '-28px', zIndex: 1 }}>
//             <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>

//               <div className="w-50 h-20">
//                 <img src={logo} alt="EduNova AI logo" />
//               </div>

//               <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#1a1a2e', marginBottom: '22px', textAlign: 'center', letterSpacing: '-0.4px' }}>
//                 Create an account
//               </h1>

//               <button
//                 type="button"
//                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '13px 20px', borderRadius: '10px', border: '1.5px solid #E0E0E0', backgroundColor: '#fff', cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '18px' }}
//                 onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5')}
//                 onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff')}
//               >
//                 <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>Create account with Google</span>
//                 <GoogleIcon />
//               </button>

//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '18px' }}>
//                 <span style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0', display: 'block' }} />
//                 <span style={{ fontSize: '13px', color: '#999', flexShrink: 0 }}>Or</span>
//                 <span style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0', display: 'block' }} />
//               </div>

//               <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <div
//                   onClick={triggerFileInput}
//                   style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', marginBottom: '6px' }}
//                 >
//                   {previewImage ? (
//                     <img src={previewImage} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                   ) : (
//                     <span style={{ color: '#9ca3af', fontSize: '13px' }}>+ Photo</span>
//                   )}
//                 </div>
//                 <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
//                 <p style={{ fontSize: '11px', color: '#6b7280' }}>Click to upload profile photo</p>
//               </div>

//               <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Full Name</label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     placeholder="Enter your full name"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     required={!isLogin}
//                     style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E0E0E0', fontSize: '14px', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#fff' }}
//                     onFocus={e => (e.currentTarget.style.borderColor = '#6C3EF4')}
//                     onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
//                   />
//                 </div>

//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444', marginBottom: '6px', display: 'block' }}>I am a:</label>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
//                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
//                       <input
//                         type="radio"
//                         name="userType"
//                         value={UserTypeEnum.Student}
//                         checked={formData.userType === UserTypeEnum.Student}
//                         onChange={() => setFormData(prev => ({ ...prev, userType: UserTypeEnum.Student }))}
//                       />
//                       Student
//                     </label>
//                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
//                       <input
//                         type="radio"
//                         name="userType"
//                         value="2"
//                         checked={formData.userType === UserTypeEnum.Instructor}
//                         onChange={() => setFormData(prev => ({ ...prev, userType: UserTypeEnum.Instructor }))}
//                       />
//                       Instructor
//                     </label>
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Email Address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email address"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E0E0E0', fontSize: '14px', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#fff' }}
//                     onFocus={e => (e.currentTarget.style.borderColor = '#6C3EF4')}
//                     onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
//                   />
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Password</label>
//                   <div style={{ position: 'relative', width: '100%' }}>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       placeholder="Create a password (min 8 characters)"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       minLength={8}
//                       style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: '10px', border: '1.5px solid #E0E0E0', fontSize: '14px', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', backgroundColor: '#fff' }}
//                       onFocus={e => (e.currentTarget.style.borderColor = '#6C3EF4')}
//                       onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
//                     />
//                     <button
//                       type="button"
//                       style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
//                       onClick={() => setShowPassword(v => !v)}
//                     >
//                       {showPassword ? <Eye size={18} color="#999" /> : <EyeOff size={18} color="#999" />}
//                     </button>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#1a1a2e', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '4px', letterSpacing: '0.2px' }}
//                   onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3a2ad4')}
//                   onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a2e')}
//                 >
//                   Sign Up
//                 </button>
//               </form>

//               <p style={{ fontSize: '13px', color: '#666', marginTop: '14px', textAlign: 'center' }}>
//                 Already have an account?{' '}
//                 <button type="button" onClick={() => setIsLogin(true)} style={{ color: '#1a1a2e', fontWeight: 700, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
//                   Log in
//                 </button>
//               </p>

//               <div style={{ display: 'flex', gap: '18px', marginTop: '22px', alignItems: 'center', justifyContent: 'center' }}>
//                 <a href="#" aria-label="Facebook" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><FacebookIcon /></a>
//                 <a href="#" aria-label="X / Twitter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><TwitterXIcon /></a>
//                 <a href="#" aria-label="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><InstagramIcon /></a>
//                 <a href="#" aria-label="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textDecoration: 'none' }}><LinkedInIcon /></a>
//               </div>

//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
// //---------------------------_---------------------------_---------------------------_---------------------------_---------------------------_
import { useState, useRef, useContext, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { UserService } from '../api/userService';
import { UserTypeEnum } from '../types/UserType';
import { UserContext } from '../contexts/userContext';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/landingPage/Logo_landing_page.png';
import signInImage from '../assets/SignIn/Sign_in_img.png';
import signUpImage from '../assets/SignIn/Sign_up_image.png';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  profileImage: File | null;
  userType: UserTypeEnum;
}

export default function SignupLoginPage({ onClose }: { onClose: () => void }) {
  const { setUser } = useContext(UserContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  /* ============ PREVENT BACKGROUND SCROLL ============ */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  function handleSignup() {
    setAuthError(null);
    const firstNameData = formData.fullName.split(' ')[0];
    const lastNameData = formData.fullName.split(' ').slice(1).join(' ') || '';
    UserService.create({
      userType: formData.userType,
      email: formData.email,
      password: formData.password,
      firstName: firstNameData,
      lastName: lastNameData,
      photo: formData.profileImage,
    })
      .then(() => {
        setIsLogin(true);
      })
      .catch((error: any) => {
        setAuthError(error?.response?.data || error?.message || 'Sign up failed. Please try again.');
      });
  }

  const handleLogin = () => {
    setAuthError(null);
    UserService.getByEmailAndPassword(formData.email, formData.password)
      .then(response => {
        const accessToken = response?.token || response?.accessToken;
        if (response && accessToken) {
          const normalizedUser = {
            id: response.id,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            userType: response.userType,
            photoUrl: response.photoUrl,
            accessToken,
          };

          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          onClose();
          return;
        }

        setAuthError('Login failed: missing access token from server response.');
      })
      .catch((error: any) => {
        console.error('Login failed:', error);
        setAuthError(error?.response?.data || error?.message || 'Login failed. Please verify your credentials.');
      });
  };

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    profileImage: null,
    userType: UserTypeEnum.Student,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) handleLogin();
    else handleSignup();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:border-violet-500 transition-colors";

  const labelClass = "text-xs font-medium text-gray-500 mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-[80%] max-h-[95vh] flex rounded-3xl overflow-hidden shadow-2xl bg-black animate-scaleIn"
      >
        {isLogin ? (
          <>
            <div className="w-[52%] flex items-center justify-center px-10 py-10 bg-white rounded-r-3xl">
              <div className="w-full max-w-md flex flex-col items-center">
                <img src={logo} className="h-16 mb-6" />

                <h1 className="text-2xl font-semibold mb-6">Login to your account</h1>

                {authError && (
                  <div className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-black text-white font-semibold">
                    Log In
                  </button>
                </form>

                <p className="text-xs mt-4">
                  Don't have an account?{" "}
                  <button onClick={() => setIsLogin(false)} className="font-bold">
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            <div className="flex-1">
              <img src={signInImage} className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <>
            <div className="w-[48%]">
              <img src={signUpImage} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex items-center justify-center px-10 py-10 bg-white rounded-l-3xl">
              <div className="w-full max-w-md flex flex-col items-center">
                <img src={logo} className="h-16 mb-6" />

                <h1 className="text-2xl font-semibold mb-6">Create an account</h1>

                {authError && (
                  <div className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className={inputClass}
                    />
                  </div>

                  <button className="w-full py-3 rounded-xl bg-black text-white font-semibold">
                    Sign Up
                  </button>
                </form>

                <p className="text-xs mt-4">
                  Already have an account?{" "}
                  <button onClick={() => setIsLogin(true)} className="font-bold">
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
