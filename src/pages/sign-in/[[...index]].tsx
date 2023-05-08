import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <SignIn path="/sign-up" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;
