import { useRef, useState } from 'react';
import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from 'react-router';
import { Form, useActionData, useLoaderData, useNavigation } from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { createSupabaseServer } from '~/utils/supabase.server';
import { toast } from "sonner"
import React from 'react';

export { ErrorBoundary };

export async function loader({ request }: LoaderFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	// Get the user's session first
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();
	if (sessionError || !session) {
		throw new Error('Not authenticated');
	}

	// Get the profile using the user's ID
	const { data: profile, error } = await supabase
		.from('candidate_profiles')
		.select('*')
		.eq('profile_id', session.user.id)
		.single();

	if (error) {
		throw new Error('Failed to load profile');
	}

	return { profile };
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	// Get the user's session first
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();
	if (sessionError || !session) {
		throw new Error('Not authenticated');
	}

	// Handle resume upload if present
	const resumeFile = formData.get('resume') as File;
	let resumeData = null;

	if (resumeFile && resumeFile.size > 0) {
		// Validate file type
		if (resumeFile.type !== 'application/pdf') {
			return { error: 'Only PDF files are allowed', success: false } as const;
		}

		// Validate file size (5MB)
		if (resumeFile.size > 5 * 1024 * 1024) {
			return { error: 'File size must be less than 5MB', success: false } as const;
		}

		try {
			// Create a unique filename
			const timestamp = new Date().getTime();
			const fileName = `${session.user.id}/${timestamp}-resume.pdf`;

			// Upload file
			const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, resumeFile, {
				cacheControl: '3600',
				upsert: true,
			});

			if (uploadError) {
				console.error('Failed to upload resume', uploadError);
				return { error: 'Failed to upload resume', success: false } as const;
			}

			// Get the public URL
			const {
				data: { publicUrl },
			} = supabase.storage.from('resumes').getPublicUrl(fileName);

			resumeData = {
				url: publicUrl,
				filename: resumeFile.name,
			};
		} catch (error) {
			console.error('Failed to handle resume upload', error);
			return { error: 'Failed to upload resume', success: false } as const;
		}
	}

	const updates = {
		name: formData.get('name'),
		phone: formData.get('phone'),
		title: formData.get('title'),
		experience_years: parseInt(formData.get('experience_years') as string) || null,
		skills:
			formData
				.get('skills')
				?.toString()
				.split(',')
				.map(s => s.trim())
				.filter(Boolean) || [],
		bio: formData.get('bio'),
		location: formData.get('location'),
		...(resumeData && {
			resume_url: resumeData.url,
			resume_filename: resumeData.filename,
		}),
	};

	// Validate required fields
	if (!updates.name || !updates.title) {
		return { error: 'Name and title are required', success: false } as const;
	}

	const { error } = await supabase
		.from('candidate_profiles')
		.update(updates)
		.eq('profile_id', session.user.id)
		.single();

	if (error) {
		console.error('Failed to update profile', error);
		return { error: 'Failed to update profile', success: false } as const;
	}

	return redirect('/candidate/profile');
}

function LoadingProfile() {
	return (
		<div className="p-6 max-w-4xl mx-auto animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div className="h-8 w-32 bg-gray-200 rounded"></div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i}>
									<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
									<div className="h-10 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>

						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i}>
									<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
									<div className="h-10 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>
					</div>

					<div className="mt-6">
						<div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FileUpload({ currentResume }: { currentResume?: { url: string; filename: string } }) {
	const [dragActive, setDragActive] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleFile = (file: File) => {
		if (file.type === 'application/pdf') {
			setSelectedFile(file);
			if (inputRef.current) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				inputRef.current.files = dataTransfer.files;
			}
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	return (
		<div className="mt-6">
			<label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
			<div
				className={`relative border-2 border-dashed rounded-lg p-6 transition-colors
					${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
				`}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<input
					ref={inputRef}
					type="file"
					name="resume"
					accept=".pdf"
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					onChange={handleChange}
				/>

				<div className="text-center">
					{selectedFile || currentResume ? (
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<div>
								{selectedFile ? (
									<span className="text-sm text-gray-900 font-medium">{selectedFile.name}</span>
								) : (
									currentResume && (
										<a
											href={currentResume.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-blue-600 hover:text-blue-800 font-medium"
										>
											{currentResume.filename}
										</a>
									)
								)}
								<p className="text-xs text-gray-500 mt-1">Click or drag to replace</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
									/>
								</svg>
							</div>
							<div className="mt-2">
								<span className="text-sm text-gray-600">
									Drop your resume here or{' '}
									<span className="text-blue-600 hover:text-blue-800 cursor-pointer">browse</span>
								</span>
								<p className="text-xs text-gray-500 mt-1">PDF only, max 5MB</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ProfileEditScreen() {
	const { profile } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const actionData = useActionData<typeof action>();
	const isSubmitting = navigation.state === 'submitting';

	React.useEffect(() => {
		if (actionData?.success) {
			toast.success("Profile has been updated");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (navigation.state === 'loading') {
		return <LoadingProfile />;
	}

	const currentResume = profile.resume_url
		? {
				url: profile.resume_url,
				filename: profile.resume_filename,
			}
		: undefined;

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Edit Profile</h1>
			</div>

			{actionData?.error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{actionData.error}</div>
			)}

			<Form method="post" className="bg-white rounded-lg shadow overflow-hidden" encType="multipart/form-data">
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
								<input
									type="text"
									name="name"
									defaultValue={profile.name}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
								<input
									type="tel"
									name="phone"
									defaultValue={profile.phone || ''}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
								<input
									type="text"
									name="title"
									defaultValue={profile.title || ''}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
									required
								/>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
								<input
									type="text"
									name="location"
									defaultValue={profile.location || ''}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
								<input
									type="number"
									name="experience_years"
									defaultValue={profile.experience_years || 0}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
									min="0"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
								<input
									type="text"
									name="skills"
									defaultValue={profile.skills?.join(', ')}
									className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-gray-700"
									placeholder="React, TypeScript, Node.js"
								/>
							</div>
						</div>
					</div>

					<div className="mt-6">
						<label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
						<textarea
							name="bio"
							defaultValue={profile.bio || ''}
							className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
							rows={4}
						/>
					</div>

					<FileUpload currentResume={currentResume} />

					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={() => window.history.back()}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
						>
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</Form>
		</div>
	);
}
