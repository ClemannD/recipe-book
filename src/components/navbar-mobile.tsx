import { UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import {
  CalendarRange,
  Globe2,
  MenuIcon,
  Tags,
  UtensilsCrossed,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const NavbarMobile = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={clsx(
        'sticky left-0 top-0 z-50 flex w-full transform flex-col overflow-hidden border-b bg-white transition-all duration-300 ease-in-out lg:hidden',
        isExpanded ? 'h-screen max-h-screen' : 'h-14'
      )}
    >
      <div className="flex h-14 min-h-[56px] items-center justify-between px-4">
        <Link href={'/'} className="w-14 text-xl">
          🥘 📖
        </Link>
        <Link href={'/'}>
          <h1 className="font-merri text-lg font-bold">Recipe Book</h1>
        </Link>
        <button
          className="flex w-14 items-center justify-end"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex flex-grow flex-col">
        <NavItems />
        <UserNavItem />
      </div>
    </div>
  );
};

export default NavbarMobile;

const NavItems = () => {
  const user = useUser();

  return (
    <div className={clsx('border-t')}>
      <NavItem href="/shared-recipes" name="Shared Recipes" icon={<Globe2 />} />

      {user.isSignedIn && (
        <>
          <NavItem
            href="/recipes"
            name="Your Recipes"
            icon={<UtensilsCrossed />}
          />
          <NavItem
            href="/meal-plans"
            name="Meal Plans"
            icon={<CalendarRange />}
          />
          <NavItem href="/recipe-tags" name="Recipe Tags" icon={<Tags />} />
        </>
      )}
    </div>
  );
};

const NavItem = ({
  href,
  name,
  icon,
}: {
  href: string;
  name: string;
  icon: React.ReactNode;
}) => {
  const { asPath } = useRouter();

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center text-slate-900',
        'h-16 w-full px-6',
        asPath === href && 'bg-slate-100 font-medium'
      )}
    >
      {icon}
      <span className="ml-2">{name}</span>
    </Link>
  );
};

const UserNavItem = () => {
  const { user } = useUser();
  return (
    <div
      className={clsx(
        'flex h-20 w-full items-center justify-center border-b border-t'
      )}
    >
      <UserButton />
      <div className="ml-3 ">{user?.fullName}</div>
    </div>
  );
};
