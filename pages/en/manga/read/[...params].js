import { useEffect, useRef, useState } from "react";
import { LeftBar } from "@/components/manga/leftBar";
import { useRouter } from "next/router";
import RightBar from "@/components/manga/rightBar";
import FirstPanel from "@/components/manga/panels/firstPanel";
import SecondPanel from "@/components/manga/panels/secondPanel";
import ThirdPanel from "@/components/manga/panels/thirdPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]";
import BottomBar from "@/components/manga/mobile/bottomBar";
import TopBar from "@/components/manga/mobile/topBar";
import Head from "next/head";
import ShortCutModal from "@/components/manga/modals/shortcutModal";
import ChapterModal from "@/components/manga/modals/chapterModal";
// import getConsumetPages from "@/lib/consumet/manga/getPage";
import { mediaInfoQuery } from "@/lib/graphql/query";
// import { redis } from "@/lib/redis";
// import getConsumetChapters from "@/lib/consumet/manga/getChapters";
import { toast } from "sonner";
import {
  getPages,
  getChapters,
  getAnilistIdFromMangadex,
} from "@/lib/mangadex";

export default function Read({
  data,
  info,
  chaptersData,
  currentId,
  sessions,
  provider,
  mangaDexId,
  number,
}) {
  const [chapter, setChapter] = useState([]);
  const [layout, setLayout] = useState(1);

  const [visible, setVisible] = useState(true);
  const [mobileVisible, setMobileVisible] = useState(true);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [isChapOpen, setIsChapOpen] = useState(false);

  const [seekPage, setSeekPage] = useState(0);

  const [paddingX, setPaddingX] = useState(208);
  const [scaleImg, setScaleImg] = useState(1);

  const [nextChapter, setNextChapter] = useState(null);
  const [prevChapter, setPrevChapter] = useState(null);

  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const hasRun = useRef(false);

  const router = useRouter();

  // console.log({ info });

  useEffect(() => {
    toast.message("This page is still under development", {
      description: "If you found any bugs, please report it to us!",
      position: "top-center",
      duration: 10000,
    });
  }, []);

  useEffect(() => {
    hasRun.current = false;
    const chapters = chaptersData.find((x) => x.providerId === provider);
    const currentChapter = chapters.chapters?.find((x) => x.id === currentId);

    setCurrentChapter(currentChapter);
    setChapter(chapters);

    if (Array.isArray(chapters?.chapters)) {
      const currentIndex = chapters.chapters.findIndex(
        (chapter) => chapter.id === currentId
      );
      if (currentIndex !== -1) {
        const nextChapter = chapters.chapters[currentIndex - 1];
        const prevChapter = chapters.chapters[currentIndex + 1];
        setNextChapter(nextChapter ? nextChapter : null);
        setPrevChapter(prevChapter ? prevChapter : null);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      event.preventDefault();
      if (event.key === "ArrowRight" && event.ctrlKey && nextChapter?.id) {
        router.push(
          `/en/manga/read/${
            chapter.providerId
          }?id=${mangaDexId}&chapterId=${encodeURIComponent(nextChapter?.id)}${
            info?.id?.length > 6 ? "" : `&anilist=${info?.id}`
          }&num=${nextChapter?.number}`
        );
      } else if (
        event.key === "ArrowLeft" &&
        event.ctrlKey &&
        prevChapter?.id
      ) {
        router.push(
          `/en/manga/read/${
            chapter.providerId
          }?id=${mangaDexId}&chapterId=${encodeURIComponent(prevChapter?.id)}${
            info?.id?.length > 6 ? "" : `&anilist=${info?.id}`
          }&num=${prevChapter?.number}`
        );
      }
      if (event.code === "Slash" && event.ctrlKey) {
        setIsKeyOpen(!isKeyOpen);
      }
      if (event.key === "f" || event.key === "F") {
        setVisible(!visible);
      }
      if (event.code === "ArrowUp" && event.shiftKey) {
        setPaddingX(paddingX - 50);
      } else if (event.code === "ArrowDown" && event.shiftKey) {
        setPaddingX(paddingX + 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextChapter?.id, prevChapter?.id, visible, isKeyOpen, paddingX]);

  return (
    <>
      <Head>
        <title>
          {info
            ? `Manga - ${
                info.title.romaji || info.title.english || info.title.native
              }`
            : "Getting Info..."}
        </title>
        <meta
          name="title"
          data-title-romaji={info?.title?.romaji}
          data-title-english={info?.title?.english}
          data-title-native={info?.title?.native}
        />
        <meta id="CoverImage" data-manga-cover={info?.coverImage} />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="w-screen flex justify-evenly relative">
        <ShortCutModal isOpen={isKeyOpen} setIsOpen={setIsKeyOpen} />
        <ChapterModal
          id={info?.id}
          currentId={currentId}
          data={chapter}
          isOpen={isChapOpen}
          setIsOpen={setIsChapOpen}
        />

        {mobileVisible && (
          <>
            <TopBar info={info} />
            <BottomBar
              id={info?.id}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              currentPage={currentPage}
              chapter={chapter}
              data={data}
              setSeekPage={setSeekPage}
              setIsOpen={setIsChapOpen}
              number={number}
              mangadexId={mangaDexId}
            />
          </>
        )}
        {visible && (
          <LeftBar
            data={chapter}
            page={data}
            info={info}
            number={number}
            mediaId={mangaDexId}
            currentId={currentId}
            setSeekPage={setSeekPage}
            providerId={provider}
          />
        )}
        {layout === 1 && (
          <FirstPanel
            aniId={info?.id}
            providerId={provider}
            data={data}
            hasRun={hasRun}
            currentId={currentId}
            seekPage={seekPage}
            setSeekPage={setSeekPage}
            visible={visible}
            setVisible={setVisible}
            chapter={chapter}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            paddingX={paddingX}
            session={sessions}
            mobileVisible={mobileVisible}
            setMobileVisible={setMobileVisible}
            setCurrentPage={setCurrentPage}
            mangadexId={mangaDexId}
            number={number}
          />
        )}
        {layout === 2 && (
          <SecondPanel
            aniId={info?.id}
            data={data}
            chapterData={chapter}
            hasRun={hasRun}
            currentChapter={currentChapter}
            currentId={currentId}
            seekPage={seekPage}
            setSeekPage={setSeekPage}
            visible={visible}
            setVisible={setVisible}
            session={sessions}
            providerId={provider}
          />
        )}
        {layout === 3 && (
          <ThirdPanel
            aniId={info?.id}
            data={data}
            chapterData={chapter}
            hasRun={hasRun}
            currentId={currentId}
            currentChapter={currentChapter}
            seekPage={seekPage}
            setSeekPage={setSeekPage}
            visible={visible}
            setVisible={setVisible}
            session={sessions}
            scaleImg={scaleImg}
            setMobileVisible={setMobileVisible}
            mobileVisible={mobileVisible}
            providerId={provider}
          />
        )}
        {visible && (
          <RightBar
            id={info?.id}
            hasRun={hasRun}
            error={data?.error}
            session={sessions}
            data={data}
            currentId={currentId}
            currentChapter={currentChapter}
            layout={layout}
            setLayout={setLayout}
            paddingX={paddingX}
            setPaddingX={setPaddingX}
            setIsKeyOpen={setIsKeyOpen}
            scaleImg={scaleImg}
            setScaleImg={setScaleImg}
          />
        )}
      </div>
    </>
    // <p></p>
  );
}

export async function getServerSideProps(context) {
  const query = context.query;
  const providerId = query.params[0];
  const chapterId = query.chapterId;
  const mediaId = query.id; // MangaDex manga id
  const number = query.num;
  let anilistId = query.anilist;

  const session = await getServerSession(context.req, context.res, authOptions);
  const accessToken = session?.user?.token || null;

  let dataManga;
  let chapters = [];

  try {
    [dataManga, chapters] = await Promise.all([
      getPages(chapterId),
      getChapters(mediaId),
    ]);
  } catch (error) {
    console.error("MangaDex request failed:", error);
    dataManga = { error: error.message };
  }

  if (!anilistId) {
    try {
      anilistId = await getAnilistIdFromMangadex(mediaId);
    } catch (error) {
      anilistId = null;
    }
  }

  const hasProvider = chapters?.some((x) => x.providerId === providerId);

  if (
    !hasProvider ||
    !Array.isArray(dataManga) ||
    dataManga.length === 0 ||
    dataManga?.error
  ) {
    return {
      redirect: {
        destination: `/en/manga/${anilistId || mediaId}?chapter=404`,
        permanent: false,
      },
    };
  }

  let info = null;

  if (anilistId) {
    const response = await fetch("https://graphql.anilist.co/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        query: mediaInfoQuery,
        variables: {
          id: parseInt(anilistId),
          type: "MANGA",
        },
      }),
    });
    const json = await response.json();
    info = json?.data?.Media || null;
  }

  return {
    props: {
      data: dataManga,
      mangaDexId: mediaId,
      info: info,
      number: number,
      chaptersData: chapters,
      currentId: chapterId,
      sessions: session,
      provider: providerId,
    },
  };
}
