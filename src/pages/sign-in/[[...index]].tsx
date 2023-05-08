import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-in" />
    </div>
  );
};

export default SignInPage;
