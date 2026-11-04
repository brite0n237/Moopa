import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";

const web = {
  version: "v4.4.1"
};

const logs = [
  {
    version: "v4.4.1",
    pre: false,
    notes: null,
    highlights: true,
    changes: [
      "New player layout for mobile devices",
      "Added seek buttons in the player",
      "Added previous and next episode buttons in the player",
      "Added rate modal when user finished watching the whole series",
      "Fix: only half of the episodes has episodes thumbnail",
      "Fix: pressing back button in anime info page redirects user to the wrong page",
      "Progressively migrate codebase to typescript"
    ]
  }
  // {
  //   version: "v4.4.0",
  //   pre: false,
  //   notes: null,
  //   highlights: false,
  //   changes: [
  //     "Added rate modal when user finished watching the whole series",
  //     "Fix: only half of the episodes has episodes thumbnail",
  //     "Fix: pressing back button in anime info page redirects user to the wrong page",
  //     "Progressively migrate codebase to typescript"
  //   ]
  // }
  // {
  //   version: "v4.3.1",
  //   pre: true,
  //   notes: null,
  //   highlights: false,
  //   changes: [
  //     "Fix: Auto Next Episode forcing to play sub even if dub is selected",
  //     "Fix: Episode metadata not showing after switching to dub",
  //     "Fix: Profile picture weirdly cropped",
  //     "Fix: Weird padding on the navbar in profile page",
  //   ],
  // },
  // {
  //   version: "v4.3.0",
  //   pre: true,
  //   notes: null,
  //   highlights: false,
  //   changes: [
  //     "Added changelogs section",
  //     "Added recommendations based on user lists",
  //     "New Player!",
  //     "And other minor bug fixes!",
  //   ],
  // },
];

export default function ChangeLogs() {
  let [isOpen, setIsOpen] = useState(false);
  let completeButtonRef = useRef(null);

  function closeModal() {
    localStorage.setItem("version", web.version);
    setIsOpen(false);
  }

  function getVersion() {
    let version = localStorage.getItem("version");
    if (version !== web.version) {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    getVersion();
  }, []);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeModal}
          initialFocus={completeButtonRef}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded bg-secondary p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-100"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xl">Changelogs</p>
                    </div>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      Hi! Welcome to the new changelogs section. Here you can
                      see a lists of the latest changes and updates to the site.
                    </p>
                    {/* <p className="inline-block text-sm italic my-2 text-gray-400">
                      *This update is still in it's pre-release state, please
                      expect to see some bugs. If you find any, please report
                      them.
                    </p> */}
                  </div>

                  {logs.map((x) => (
                    <ChangelogsVersions
                      notes={x.notes}
                      version={x.version}
                      pre={x.pre}
                      key={x.version}
                    >
                      {x.changes.map((i, index) => (
                        <p key={index}>- {i}</p>
                      ))}
                    </ChangelogsVersions>
                  ))}


                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1" />
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-action/10 px-4 py-2 text-sm font-medium text-action/90 hover:bg-action/20 focus:outline-none"
                      onClick={closeModal}
                      ref={completeButtonRef}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

type ChangelogsVersionsProps = {
  version?: string;
  pre: boolean;
  notes?: string | null;
  highlights?: boolean;
  children: React.ReactNode;
};

export function ChangelogsVersions({
  version,
  pre,
  notes,
  highlights,
  children
}: ChangelogsVersionsProps) {
  return (
    <>
      <div className="my-2 flex items-center justify-evenly">
        <div className="w-full h-[1px] bg-gradient-to-r from-white/5 to-white/40" />
        <p className="relative flex flex-1 whitespace-nowrap font-bold mx-2 font-inter">
          {version}
          {pre && (
            <span className="flex text-xs font-light font-roboto ml-1 italic">
              pre
            </span>
          )}
        </p>
        <div className="w-full h-[1px] bg-gradient-to-l from-white/5 to-white/40" />
      </div>

      <div className="flex flex-col gap-2 text-sm py-2 text-gray-200">
        <div>
          {notes && (
            <p className="inline-block italic mb-2 text-gray-400">*{notes}</p>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
