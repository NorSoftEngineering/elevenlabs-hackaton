import { Link } from 'react-router';
import { useOrganization } from '~/contexts/OrganizationContext';

export default function ProtectedIndex() {
  const { currentOrganization, userRole } = useOrganization();

  if (!currentOrganization) {
    return null;
  }

  return (
    <div>
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-gray-900">Organization Information</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Details and settings for your organization.
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Organization name</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {currentOrganization.name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Your role</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {userRole}
              </dd>
            </div>
          </dl>
        </div>

        {userRole && ['owner', 'admin'].includes(userRole) && (
          <div className="mt-6 flex items-center gap-x-6">
            <Link
              to={`/protected/orgs/${currentOrganization.slug}/settings`}
              className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Organization Settings
            </Link>
            <Link
              to={`/protected/orgs/${currentOrganization.slug}/members`}
              className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Manage Members
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 