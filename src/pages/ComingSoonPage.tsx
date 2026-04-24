interface ComingSoonPageProps {
  title: string;
}

const ComingSoonPage = ({ title }: ComingSoonPageProps) => {
  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 text-base text-slate-600">
        This section is not available yet in this build.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Use the sidebar to continue with available features like Home, Chat AI, My Learning, and My Courses.
      </p>
    </div>
  );
};

export default ComingSoonPage;
