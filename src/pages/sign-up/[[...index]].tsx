import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;
