import clsx from 'clsx';
import { cn } from '../../utils/cn';
import Layout from '../layout';

const RecipesPageLayout = ({
  isExpanded,
  isFullScreen,
  leftChildren,
  rightChildren,
}: {
  isExpanded: boolean;
  isFullScreen: boolean;
  leftChildren: React.ReactNode;
  rightChildren: React.ReactNode;
}) => {
  return (
    <Layout>
      <div className="relative flex">
        <div
          className={clsx(
            `max-h-screen w-screen flex-grow p-4 pb-12 transition-all duration-300 ease-in-out lg:w-[550px] lg:p-10`,
            isExpanded
              ? 'overflow-hidden lg:overflow-y-auto'
              : 'overflow-y-auto'
          )}
        >
          {leftChildren}
        </div>

        {/* Dummy component to help with positioning */}
        <div
          className={cn(
            clsx(
              `h-screen max-h-screen max-w-[700px] transition-all duration-300 ease-in-out`,
              isExpanded ? 'w-[600px] min-w-[600px]' : 'w-0 min-w-0'
            )
          )}
        ></div>

        <div
          className={cn(
            clsx(
              `fixed top-0 z-50 h-screen max-h-screen max-w-[700px] overflow-y-auto  bg-white transition-all duration-300 ease-in-out lg:absolute`,
              isExpanded
                ? isFullScreen
                  ? 'right-0 w-full min-w-full'
                  : 'right-0 w-full min-w-full lg:w-[600px] lg:min-w-[600px] lg:border-l'
                : 'right-[-600px] w-[600px] min-w-[600px]'
            )
          )}
        >
          {rightChildren}
        </div>
      </div>
    </Layout>
  );
};

export default RecipesPageLayout;
