"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { site, links, socials } from "@/content/site";
import { EmailReveal } from "@/components/ui/EmailReveal";
import { ExternalArrow, SocialIcon } from "@/components/ui/Icons";
import styles from "./studyObjects.module.css";

export type StudySceneKind = "brand" | "smartphone" | "laptop" | "notebook" | "calendar" | "contact";

type Props = {
  kind: StudySceneKind;
  onClose: () => void;
  onOpenBook: (book: "why-henry" | "dream-payoff") => void;
};

function calendarDates(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const first = new Date(year, month, 1).getDay();
  const slots: Array<number | null> = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) slots.push(d);
  while (slots.length % 7 !== 0) slots.push(null);
  return slots;
}

const pageNames = ["The Idea", "The Work", "What Comes Next"];
const journalTitles = ["A Note from Javier", "On the Writing Desk", "The Way I Work"];
const steps = ["Create", "Build", "Break it", "Fix it", "Learn", "Keep moving"];

export function StudyObjectExperience({ kind, onClose, onOpenBook }: Props) {
  const unfiltr = getProject("unfiltr")!;
  const swh = getProject("sports-wager-helper")!;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [phoneScreen, setPhoneScreen] = useState(0);
  const [brandPage, setBrandPage] = useState(0);
  const [journalPage, setJournalPage] = useState(0);
  const [magnified, setMagnified] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const days = useMemo(() => today ? calendarDates(today) : [], [today]);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    setToday(new Date());
    // The seal is broken after the visitor has selected the object. No audio
    // and no second click; the parchment unfolds automatically.
    const opening = window.setTimeout(() => setLetterOpened(true), 180);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(opening); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const screenshotCount = unfiltr.media.screenshots?.length || 0;
  const sceneLabel = ({
    brand: "Framed IHBNF storybook",
    smartphone: "Unfiltr phone",
    laptop: "Sports Wager Helper laptop",
    notebook: "Writing journal",
    calendar: "Study calendar",
    contact: "Sealed correspondence",
  } as const)[kind];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={sceneLabel}
      data-testid={"in-room-modal-" + kind}
      className={styles.overlay}
    >
      <button
        type="button"
        data-testid="in-room-modal-backdrop"
        aria-label="Return to study"
        className={styles.backdrop}
        onClick={onClose}
      />
      <div className={styles.positioner}>
        <div className={styles.scene} data-kind={kind}>
          <div className={styles.toolbar}>
            <span className={styles.chapter}>{sceneLabel}</span>
            <button ref={closeRef} type="button" data-testid="close-in-room-modal-btn" className={styles.close} onClick={onClose}>
              <span aria-hidden="true">←</span> Return to Study
            </button>
          </div>

          {kind === "brand" && (
            <div className={styles.bookWorld}>
              <div className={styles.bookCoverEdge} aria-hidden="true" />
              <div className={styles.openBook} data-page={brandPage} data-magnified={magnified}>
                <div className={styles.paperPage}>
                  <div className={styles.pageTop}>IHBNF · Idle Hands Bear No Fruit</div>
                  <div className={styles.emblem}>
                    <Image src="/media/brand/ihbnf-icon.svg" alt="Hands holding soil and a growing seedling" fill sizes="(max-width: 650px) 60vw, 360px" className="object-contain" />
                  </div>
                  <div className={styles.paperCaption}>Something starts when you put in the work.</div>
                  <span className={styles.pageNumber}>1</span>
                </div>
                <div className={styles.paperPage} key={brandPage}>
                  <div className={styles.pageTop}>{pageNames[brandPage]}</div>
                  {brandPage === 0 && (
                    <>
                      <h2 id="in-room-presentation-title" className={styles.paperHeading}>Idle Hands Bear No Fruit.</h2>
                      <p>I wanted one place where all the things I create could live together. Books, apps, ideas, and everything still taking shape.</p>
                      <p>Different projects. Same idea: show up, do the work, and keep making something worth sharing.</p>
                    </>
                  )}
                  {brandPage === 1 && (
                    <>
                      <h2 id="in-room-presentation-title" className={styles.paperHeading}>The work is the story.</h2>
                      <p>From the worlds of <strong>The Unwritten Journey</strong> to <strong>The Dream of the Payoff</strong>, each book started as an idea I refused to leave alone.</p>
                      <div className={styles.paperActions}>
                        <button onClick={() => onOpenBook("why-henry")}>Open Why Henry?</button>
                        <button onClick={() => onOpenBook("dream-payoff")}>Open The Dream of the Payoff</button>
                      </div>
                    </>
                  )}
                  {brandPage === 2 && (
                    <>
                      <h2 id="in-room-presentation-title" className={styles.paperHeading}>More is coming.</h2>
                      <p>I'm still writing. Still building. The shelves aren't full, and that's exactly how I want it.</p>
                      <p>Come back and see what found its way into this room next.</p>
                    </>
                  )}
                  <span className={styles.pageNumber}>{brandPage + 2}</span>
                </div>
              </div>
              <div className={styles.bookControls}>
                <button type="button" disabled={brandPage === 0} onClick={() => setBrandPage((p) => p - 1)}>← Previous page</button>
                <span>Page {brandPage + 1} of {pageNames.length}</span>
                <button type="button" onClick={() => setMagnified((v) => !v)} aria-pressed={magnified}>{magnified ? "Zoom out" : "Zoom in"}</button>
                <button type="button" disabled={brandPage === pageNames.length - 1} onClick={() => setBrandPage((p) => p + 1)}>Turn page →</button>
              </div>
            </div>
          )}

          {kind === "smartphone" && (
            <div className={styles.phoneStage}>
              <div className={styles.phoneShell}>
                <div className={styles.phoneNotch} aria-hidden="true" />
                <div className={styles.phoneStatus} aria-hidden="true"><span>9:41</span><span>●●● ▰</span></div>
                <div className={styles.phoneScreen}>
                  {screenshotCount > 0 && (
                    <Image
                      src={unfiltr.media.screenshots![phoneScreen % screenshotCount].src}
                      alt={unfiltr.media.screenshots![phoneScreen % screenshotCount].alt}
                      fill
                      sizes="(max-width: 600px) 75vw, 300px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className={styles.homeBar} aria-hidden="true" />
              </div>
              <div className={styles.deviceDetails}>
                <span className={styles.eyebrow}>A closer look · Unfiltr by Javier</span>
                <h2 id="in-room-presentation-title">A conversation that remembers.</h2>
                <p>Explore the real app screens from the device on the desk. Choose what you want to see.</p>
                <div className={styles.screenSelector} role="group" aria-label="Preview app screen">
                  {(unfiltr.media.screenshots || []).map((item, index) => (
                    <button key={item.src} type="button" onClick={() => setPhoneScreen(index)} aria-pressed={phoneScreen === index}>
                      {["Chat", "Journal", "Memory"][index] || "Screen " + (index + 1)}
                    </button>
                  ))}
                </div>
                <div className={styles.deviceLinks}>
                  <a href={links.unfiltrAppStore} target="_blank" rel="noopener noreferrer">App Store <ExternalArrow className="h-3 w-3" /></a>
                  <a href={links.unfiltrGooglePlay} target="_blank" rel="noopener noreferrer">Google Play <ExternalArrow className="h-3 w-3" /></a>
                  <a href={links.unfiltrSite} target="_blank" rel="noopener noreferrer">Visit the app website <ExternalArrow className="h-3 w-3" /></a>
                </div>
              </div>
            </div>
          )}

          {kind === "laptop" && (
            <div className={styles.laptopStage}>
              <div className={styles.laptopLid}>
                <div className={styles.laptopCamera} aria-hidden="true" />
                <div className={styles.browserBar}>
                  <span aria-hidden="true">● ● ●</span>
                  <span className={styles.address}>sportswagerhelper.com</span>
                  <a href={links.sportsWagerHelper} target="_blank" rel="noopener noreferrer">Open ↗</a>
                </div>
                <div className={styles.websiteViewport}>
                  <iframe
                    title="Interactive Sports Wager Helper website"
                    src={links.sportsWagerHelper}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className={styles.siteFrame}
                  />
                </div>
              </div>
              <div className={styles.keyboardBase} aria-hidden="true"><div className={styles.trackpad} /></div>
              <div className={styles.laptopFooter}>
                <span>Scroll inside the laptop screen to explore the live site.</span>
                <a href={links.sportsWagerHelper} target="_blank" rel="noopener noreferrer">Open full website <ExternalArrow className="h-3 w-3" /></a>
              </div>
              <p className={styles.embedNote}>If the website refuses to display inside another site, open it directly using the link above. The website controls whether embedding is permitted.</p>
            </div>
          )}

          {kind === "notebook" && (
            <div className={styles.journalStage}>
              <div className={styles.journalCover} aria-hidden="true" />
              <div className={styles.journalSpread} key={journalPage}>
                <div className={styles.journalLeaf}>
                  <div className={styles.journalLabel}>Notes from the writing desk</div>
                  <div className={styles.authorPortrait}>
                    <Image src={site.founder.photo.src} alt={site.founder.photo.alt} fill sizes="120px" className="object-cover" />
                  </div>
                  <h2 id="in-room-presentation-title">{journalTitles[journalPage]}</h2>
                  <p className={styles.signature}>— Javier</p>
                </div>
                <div className={styles.journalLeaf}>
                  {journalPage === 0 && (
                    <>
                      <p>If I'm not working hard, I'm writing books and building apps. That's where IHBNF comes from: idle hands bear no fruit.</p>
                      <p>One thing leads to another, but I want each one to mean something. I'm doing the work, learning as I go, and taking the long way if that's what it takes.</p>
                    </>
                  )}
                  {journalPage === 1 && (
                    <>
                      <p>On my desk right now are two published books and more stories that aren't finished yet.</p>
                      <div className={styles.paperActions}>
                        <button type="button" onClick={() => onOpenBook("why-henry")}>Read about Why Henry?</button>
                        <button type="button" onClick={() => onOpenBook("dream-payoff")}>Read about The Dream of the Payoff</button>
                      </div>
                    </>
                  )}
                  {journalPage === 2 && (
                    <ol className={styles.steps}>{steps.map((step, i) => <li key={step}><span>{i + 1}.</span> {step}</li>)}</ol>
                  )}
                  <div className={styles.journalFolio}>IHBNF / {journalPage + 1}</div>
                </div>
              </div>
              <div className={styles.bookControls}>
                <button type="button" disabled={journalPage === 0} onClick={() => setJournalPage((p) => p - 1)}>← Previous note</button>
                <span>{journalPage + 1} / {journalTitles.length}</span>
                <button type="button" disabled={journalPage === journalTitles.length - 1} onClick={() => setJournalPage((p) => p + 1)}>Turn page →</button>
              </div>
            </div>
          )}

          {kind === "calendar" && (
            <div className={styles.calendarScene}>
              <div className={styles.calendarPaper}>
                <div className={styles.calendarBinding} aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => <span key={i} />)}
                </div>
                <div className={styles.calendarMonth}>
                  <span>IHBNF / Desk Calendar</span>
                  <h2 id="in-room-presentation-title">{today ? today.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Calendar"}</h2>
                </div>
                <div className={styles.monthGrid} aria-label="Current month calendar">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span className={styles.weekday} key={day}>{day}</span>)}
                  {days.map((day, i) => (
                    <span key={i} className={day && today && day === today.getDate() ? styles.today : ""}>{day ?? ""}</span>
                  ))}
                </div>
                <p className={styles.calendarDisclaimer}>The dates here show the current month. Project milestones below have no invented release dates.</p>
              </div>
              <div className={styles.milestones}>
                <span className={styles.eyebrow}>Pinned to the calendar</span>
                <h3>What's happening at IHBNF</h3>
                <div><span className={styles.milestoneTag}>Published</span><strong>The Unwritten Journey — Book One: Why Henry?</strong><p>Available on Amazon.</p></div>
                <div><span className={styles.milestoneTag}>Published</span><strong>The Dream of the Payoff</strong><p>The memoir is available now.</p></div>
                <div><span className={styles.milestoneTag}>Live</span><strong>Unfiltr by Javier</strong><p>Available for iOS and Android.</p></div>
                <div><span className={styles.milestoneTag}>Project</span><strong>Sports Wager Helper</strong><p>Research and matchup tools; visit the site for current availability.</p></div>
                <p className={styles.milestoneEnd}>Future announcements will appear here once they're confirmed.</p>
              </div>
            </div>
          )}

          {kind === "contact" && (
            <div className={styles.letterScene}>
              <div className={styles.envelope} data-open={letterOpened} aria-hidden="true">
                <div className={styles.envelopeFlap} />
                <div className={styles.envelopeBody} />
                <span className={styles.waxSeal}>IH</span>
              </div>
              <article className={styles.letterPaper} data-open={letterOpened}>
                <div className={styles.letterTop}>Correspondence · IHBNF</div>
                <h2 id="in-room-presentation-title">A note from my desk.</h2>
                <p>I'd tell you exactly what comes next, but half the time I don't know yet either.</p>
                <p>Follow along, say hello, or see what I'm building. There's always something happening in this room.</p>
                <div className={styles.letterContact}><EmailReveal /></div>
                <div className={styles.letterSocials}>
                  {socials.map(s => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                      <SocialIcon name={s.key} className="h-4 w-4" /><span>{s.label}</span>
                    </a>
                  ))}
                </div>
                <div className={styles.signature}>— Javier</div>
              </article>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
