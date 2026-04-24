import Header from './components/Layout/Header'
import Home from './pages/HomePage'
import Footer from './components/Layout/Footer'
import SearchPage from './pages/SearchPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoursePage from './pages/Course/CoursePage';
import CourseContentPage from './pages/Course/CourseContentPage';
import MyLearningPage from './pages/MyLearningPage';
import CreateUpdateCoursePage from './pages/Course/CreateUpdateCoursePage';
import InstructorCoursesPage from './pages/Course/InstructorCoursesPage';
import ChatAIPage from './pages/ChatAIPage';
import ComingSoonPage from './pages/ComingSoonPage';

function App() {

  return (
  <Router>
    <div>

      <header className=''>
        <div className='container'>
          <Header></Header>
        </div>
      </header>

      <main className='ml-20 '>
        <div className='rounded-lg'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/search' element={<SearchPage />} />
              <Route path='/chat-ai' element={<ChatAIPage />} />
              <Route path='/course/:id' element={<CoursePage/>} />
              <Route path='/course/:id/content' element={<CourseContentPage/>}/>
              <Route path='/my-learning/' element= {<MyLearningPage/>}></Route>
              <Route path='/courses/new' element= {<CreateUpdateCoursePage/>}></Route>
              <Route path='/courses/:courseId/edit' element={<CreateUpdateCoursePage/>}></Route>
              <Route path='/courses/InstructorCourses' element= {<InstructorCoursesPage/>}></Route>
              <Route path='/certificate' element={<ComingSoonPage title='Certificate' />} />
              <Route path='/wishlist' element={<ComingSoonPage title='Wishlist' />} />
              <Route path='/cart' element={<ComingSoonPage title='My Cart' />} />
              <Route path='/settings' element={<ComingSoonPage title='Settings' />} />
              <Route path='/become-partner' element={<ComingSoonPage title='Become Edu Partner' />} />
              <Route path='*' element={<ComingSoonPage title='Page Not Found' />} />
            </Routes>
        </div>
      </main>

      <footer className='mt-10'>
       <div className='container w-[90%]'>
        <Footer></Footer>
        </div>
      </footer>

    </div>
  </Router>

  )
}

export default App
