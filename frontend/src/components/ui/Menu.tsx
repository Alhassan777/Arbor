import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

interface MenuItemProps {
  onClick: () => void;
  children: ReactNode;
}

export function Menu({ trigger, children }: MenuProps) {
  return (
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button as={Fragment}>{trigger}</HeadlessMenu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 focus:outline-none z-50">
          <div className="p-1">{children}</div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
}

export function MenuItem({ onClick, children }: MenuItemProps) {
  return (
    <HeadlessMenu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors',
            active
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {children}
        </button>
      )}
    </HeadlessMenu.Item>
  );
}
