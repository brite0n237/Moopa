import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

function Footer() {
  const [year] = useState(new Date().getFullYear());
  const [season] = useState(getCurrentSeason());

  const [checked, setChecked] = useState(false);

  const router = useRouter();

  function switchLang() {
    setChecked(!checked);
    if (checked) {
      router.push("/en");
    } else {
      router.push("/id");
    }
  }

  return (
    <footer className="flex-col w-full">
      <div className="text-[#dbdcdd] z-40 bg-[#0c0d10] lg:flex lg:h-[12rem] w-full lg:items-center lg:justify-between">
        <div className="mx-auto flex w-[90%] lg:w-[95%] xl:w-[80%] flex-col space-y-10 py-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:py-0">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 font-outfit text-4xl">kazani</div>
            <p className="font-karla lg:text-[0.8rem] text-[0.65rem] text-[#9c9c9c]  lg:w-[520px] italic">
              This site does not store any files on our server, we only linked
              to the media which is hosted on 3rd party services.
            </p>
          </div>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-[9.06rem] text-[#a7a7a7] text-sm lg:text-end">
            <div className="flex flex-col gap-10 font-karla font-bold lg:flex-row lg:gap-[5.94rem]">
              <ul className="flex flex-col gap-y-[0.7rem] ">
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/search/anime?season=${season}&year=${year}`}>
                    This Season
                  </Link>
                </li>
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/search/anime`}>Popular Anime</Link>
                </li>
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/search/manga`}>Popular Manga</Link>
                </li>
              </ul>
              <ul className="flex flex-col gap-y-[0.7rem]">
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/search/anime?format=MOVIE`}>Movies</Link>
                </li>
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/search/anime?format=TV`}>TV Shows</Link>
                </li>
                <li className="cursor-pointer hover:text-action">
                  <Link href={`/en/dmca`}>DMCA</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-tersier border-t border-white/5">
        <div className="mx-auto flex w-[90%] lg:w-[95%] xl:w-[80%] flex-col pb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:py-0">
          <p className="flex items-center gap-1 font-karla lg:text-[0.81rem] text-[0.7rem] text-[#CCCCCC] py-3">
            &copy; {new Date().getFullYear()} kazani | Website made by{" "}
            <span className="text-white font-bold">brit_eon</span>
          </p>
          <div className="flex items-center gap-5">
            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/brit_eon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-6 h-6 hover:opacity-75"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* TikTok Icon */}
            <a
              href="https://www.tiktok.com/@brit_eon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-6 h-6 hover:opacity-75"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                viewBox="0 0 24 24"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <label
              className="flex items-center relative w-max cursor-pointer select-none text-txt"
              title="Switch to ID"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => switchLang()}
                className="appearance-none transition-colors cursor-pointer w-14 h-5 rounded-full focus:outline-none  focus:ring-offset-2 focus:ring-offset-black focus:ring-action bg-secondary"
              />
              <span className="absolute font-medium text-xs uppercase right-2 text-action">
                {" "}
                EN{" "}
              </span>
              <span className="absolute font-medium text-xs uppercase right-[2.1rem] text-action">
                {" "}
                ID{" "}
              </span>
              <span className="w-6 h-6 right-[2.1rem] absolute rounded-full transform transition-transform bg-gray-200" />
            </label>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-based index

  switch (month) {
    case 12:
    case 1:
    case 2:
      return "WINTER";
    case 3:
    case 4:
    case 5:
      return "SPRING";
    case 6:
    case 7:
    case 8:
      return "SUMMER";
    case 9:
    case 10:
    case 11:
      return "FALL";
    default:
      return "UNKNOWN SEASON";
  }
}
