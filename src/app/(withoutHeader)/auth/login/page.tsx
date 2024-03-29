import { AuthProvider } from '../context';
import LoginContainer from './containers';

export default function Home() {
  return (
    <AuthProvider>
      <div className="h-full">
        <LoginContainer />
      </div>
    </AuthProvider>
  );
}
