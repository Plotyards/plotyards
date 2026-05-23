import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';

const AppComingSoon = () => (
  <div className="min-h-screen bg-surface px-6 pb-16 pt-32">
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-border bg-white p-8 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Smartphone size={30} />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-text">Plotyards App Coming Soon</h1>
      <p className="mt-4 text-base font-semibold leading-7 text-muted">
        We are currently working on the app to give you a better experience.
      </p>
      <Link to="/" className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600">
        Back to Home
      </Link>
    </div>
  </div>
);

export default AppComingSoon;
