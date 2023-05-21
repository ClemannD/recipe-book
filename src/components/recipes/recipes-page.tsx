import clsx from 'clsx';
import { cn } from '../../utils/cn';
import Layout from '../layout';
import { useEffect, useState } from 'react';

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
  const [scrollY, setScrollY] = useState(0);

  // This works, but maybe bad performance? Will need to see
  const handleScroll = () => {
    if (window.scrollY !== 0) {
      setScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isExpanded) {
      document.body.className = 'noscroll';
    } else {
      document.body.className = '';
      window.scrollTo(0, scrollY);
    }
  }, [handleScroll, isExpanded, scrollY]);

  return (
    <Layout>
      <div className="relative flex">
        <div
          className={clsx(
            ` w-screen flex-grow p-4 pb-12 transition-all duration-300 ease-in-out lg:w-[550px] lg:p-10`,
            isExpanded ? 'overflow-hidden' : ''
          )}
        >
          {leftChildren}
        </div>

        {/* Dummy component to help with positioning */}
        {/* <div
          className={cn(
            clsx(
              `h-screen max-h-screen max-w-[700px] transition-all duration-300 ease-in-out`,
              isExpanded ? 'w-[600px] min-w-[600px]' : 'w-0 min-w-0'
            )
          )}
        ></div> */}

        <div
          className={cn(
            clsx(
              `fixed top-0 z-50 h-screen  max-w-[700px] overflow-y-auto  bg-white transition-all duration-300 ease-in-out lg:absolute`,
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
