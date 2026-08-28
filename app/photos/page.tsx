const ALBUM_URL = "https://photos.icloud.com/shared/album/090SDXlcrJz11ZZBh6VYIszLg";

export default function PhotosPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-brass">Photos</p>
      <h1 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
        Reunion photo album
      </h1>
      <p className="mt-4 text-paper-dim">
        Browse and download photos from the shared iCloud album. Opens in a
        new tab.
      </p>

      <a
        href={ALBUM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block rounded-full bg-brass px-7 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
      >
        View &amp; download photos
      </a>
    </section>
  );
}
