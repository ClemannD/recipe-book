import { UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import {
  CalendarRange,
  Globe2,
  LucideArrowLeftSquare,
  Tags,
  UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  NavbarStateAction,
  useNavbarState,
  useNavbarStateDispatch,
} from '../utils/context/navbarState.context';

const Navbar = () => {
  const navbarState = useNavbarState();
  const navbarStateDispatch = useNavbarStateDispatch();

  const toggleDesktopNavbar = () => {
    navbarStateDispatch?.(NavbarStateAction.ToggleDesktopNavbar);
  };

  return (
    <div
      className={clsx(
        'hidden h-screen flex-col overflow-hidden whitespace-nowrap border-r bg-white transition-all duration-100 ease-in-out lg:flex',
        navbarState.desktopNavbarExpanded
          ? 'w-56 min-w-[224px]'
          : 'w-20 min-w-[80px]'
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-center',
          navbarState.desktopNavbarExpanded
            ? 'mb-16 h-auto min-w-[224px] pt-10'
            : 'border-b py-3'
        )}
      >
        <Link href="/">
          <h1
            className={clsx(
              'text-center  font-merri  font-black',
              navbarState.desktopNavbarExpanded ? 'text-5xl' : 'text-2xl'
            )}
          >
            {navbarState.desktopNavbarExpanded ? (
              <div className="mb-3 text-3xl">Recipe Book</div>
            ) : (
              <div>RB</div>
            )}
            🥘 📖
          </h1>
        </Link>
      </div>

      <NavItems isExpanded={navbarState.desktopNavbarExpanded} />

      <UserNavItem isExpanded={navbarState.desktopNavbarExpanded} />

      <div className="h-12 border-t">
        <button
          className="flex h-full w-full items-center justify-center text-sm text-slate-500 transition-colors ease-in-out hover:text-slate-800"
          onClick={toggleDesktopNavbar}
        >
          {navbarState.desktopNavbarExpanded ? (
            <>
              <LucideArrowLeftSquare className="mr-2 h-5 w-5" /> Collapse
            </>
          ) : (
            <LucideArrowLeftSquare className="h-5 w-5 rotate-180 transform" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;

const UserNavItem = ({ isExpanded }: { isExpanded: boolean }) => {
  const { user } = useUser();
  return (
    <div
      className={clsx(
        'flex h-20 w-full items-center justify-center border-t',
        isExpanded ? 'min-w-[224px]' : ''
      )}
    >
      <UserButton />
      {isExpanded && <div className="ml-3 ">{user?.fullName}</div>}
    </div>
  );
};

const NavItems = ({ isExpanded }: { isExpanded: boolean }) => {
  const user = useUser();

  return (
    <div className={clsx('flex-1')}>
      <NavItem
        href="/shared-recipes"
        name="Shared Recipes"
        icon={<Globe2 />}
        isExpanded={isExpanded}
      />

      {user.isSignedIn && (
        <>
          <NavItem
            href="/recipes"
            name="Your Recipes"
            icon={<UtensilsCrossed />}
            isExpanded={isExpanded}
          />
          <NavItem
            href="/meal-plans"
            name="Meal Plans"
            icon={<CalendarRange />}
            isExpanded={isExpanded}
          />
          <NavItem
            href="/recipe-tags"
            name="Recipe Tags"
            icon={<Tags />}
            isExpanded={isExpanded}
          />
        </>
      )}
    </div>
  );
};

const NavItem = ({
  isExpanded,
  href,
  name,
  icon,
}: {
  isExpanded: boolean;
  href: string;
  name: string;
  icon: React.ReactNode;
}) => {
  const { asPath } = useRouter();

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center text-slate-900 transition-colors ease-in-out hover:bg-slate-100',
        isExpanded
          ? 'h-16 w-full min-w-[224px] px-6'
          : 'h-20 justify-center border-b',
        asPath === href && 'bg-slate-100 font-medium'
      )}
    >
      {icon}
      {isExpanded && <span className="ml-2">{name}</span>}
    </Link>
  );
};
