import type { FC, ReactElement } from 'react';

import type { Book } from '~/interfaces/books';

import { BOOK_CARD_TEST_IDS } from '~/constants/test/bookCard';

const BookCard: FC<Book> = ({
	title,
	shortDescription,
	longDescription,
	isbn,
	thumbnailUrl,
	authors,
}: Book): ReactElement => (
	<div
		data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_CONTAINER}-${isbn}`}
		id={isbn}
		className="my-10 flex w-full flex-col items-center justify-center rounded-lg border border-brand-secondary bg-white p-6 text-center shadow-md hover:bg-brand-neutral/5"
	>
		<h2 data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_TITLE}-${isbn}`} className="mb-5 text-xl font-bold text-gray-900">
			{title}
		</h2>
		{shortDescription && (
			<p data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_SHORT_DESCRIPTION}-${isbn}`} className="text-gray-700">
				{shortDescription}
			</p>
		)}
		{longDescription && (
			<p data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_LONG_DESCRIPTION}-${isbn}`} className="text-gray-700">
				{longDescription}
			</p>
		)}
		{thumbnailUrl && (
			<img
				className="my-5"
				data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_THUMBNAIL_URL}-${isbn}`}
				src={thumbnailUrl}
				alt={title}
			/>
		)}
		{authors.map(author => (
			<p key={author} data-testid={`${BOOK_CARD_TEST_IDS.BOOK_CARD_AUTHOR}-${isbn}`} className="text-sm text-gray-600">
				{author}
			</p>
		))}
	</div>
);

export default BookCard;
