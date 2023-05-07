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
            `max-h-screen w-[550px] flex-grow overflow-y-auto p-10 transition-all duration-300 ease-in-out`
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
              `absolute top-0  h-screen max-h-screen  max-w-[700px] overflow-y-auto bg-white shadow-lg transition-all duration-300 ease-in-out`,
              isExpanded
                ? isFullScreen
                  ? ' right-0  w-full min-w-full'
                  : ' right-0 w-[600px] min-w-[600px]'
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
