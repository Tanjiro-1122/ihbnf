# 3D bookshelf lab

Run `npm run dev` and open `/lab/3d-bookshelf`. In production mode the route renders the Next.js not-found page. Use the view presets, orbit controls, and lighting controls to inspect the same meshes from several angles.

The catalog in `src/components/bookshelf/catalog.ts` defines the books in bottom-to-top order. Each entry has a stable unique ID, publication details, a local cover image, a destination link, spine colors, and physical measurements in millimeters. The height and width describe the face of the upright book. Thickness includes both boards. Use measurements that leave space for a paper block between the boards.

`bookshelfLayout` controls the maximum number of books and height per stack and the spacing between stacks. Entries exceeding a stack limit begin another stack at their original scale. The demonstration control temporarily adds copies of the two existing titles. Resetting the camera leaves the current lighting and copies in place.

The geometry factory in `src/components/bookshelf/hardcover.ts` builds two cover boards, a separate cloth spine, and a fitted paper block. It uses the supplied artwork on the front board and matching material on the back. Cover files with a different aspect ratio are fitted without distortion.
