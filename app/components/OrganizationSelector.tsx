import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { Link } from 'react-router';
import { useOrganization } from '~/contexts/OrganizationContext';

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

export function OrganizationSelector() {
	const { currentOrganization, userOrganizations, setCurrentOrganization } = useOrganization();

	if (!currentOrganization) {
		return (
			<Link
				to="/dashboard/orgs/new"
				className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
			>
				Create Organization
			</Link>
		);
	}

	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<Menu.Button className="inline-flex w-full items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-brand-secondary hover:bg-brand-neutral/5">
					{currentOrganization.name}
					<ChevronDownIcon className="-mr-1 h-5 w-5 text-brand-primary/50" aria-hidden="true" />
				</Menu.Button>
			</div>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-brand-neutral/20 rounded-md bg-white shadow-lg ring-1 ring-brand-secondary ring-opacity-5 focus:outline-none">
					<div className="py-1">
						{userOrganizations.map(org => (
							<Menu.Item key={org.id}>
								{({ active }: { active: boolean }) => (
									<button
										onClick={() => setCurrentOrganization(org)}
										className={classNames(
											active ? 'bg-brand-neutral/10 text-gray-900' : 'text-gray-700',
											'block w-full px-4 py-2 text-left text-sm',
										)}
									>
										{org.name}
									</button>
								)}
							</Menu.Item>
						))}
					</div>
					<div className="py-1">
						<Menu.Item>
							{({ active }: { active: boolean }) => (
								<Link
									to="/dashboard/orgs/new"
									className={classNames(
										active ? 'bg-brand-neutral/10 text-gray-900' : 'text-gray-700',
										'block px-4 py-2 text-sm',
									)}
								>
									Create New Organization
								</Link>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
