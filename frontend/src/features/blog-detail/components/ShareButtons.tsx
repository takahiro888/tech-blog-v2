import type { ComponentType, SVGProps } from "react";
import {
  buildShareLinks,
  type ShareService,
} from "@/features/blog-detail/lib/share-links";
import { FacebookIcon } from "@/features/blog-detail/components/icons/FacebookIcon";
import { XIcon } from "@/features/blog-detail/components/icons/XIcon";
import { HatenaBookmarkIcon } from "@/features/blog-detail/components/icons/HatenaBookmarkIcon";

const SHARE_ICONS: Record<
  ShareService,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  x: XIcon,
  facebook: FacebookIcon,
  hatena: HatenaBookmarkIcon,
};

type ShareButtonProps = {
  articleUrl: string;
  title: string;
  className?: string;
};

export function ShareButtons({
  articleUrl,
  title,
  className,
}: ShareButtonProps) {
  const shareLinks = buildShareLinks(articleUrl, title);

  return (
    <nav aria-label="記事をシェア" className={className}>
      <ul className="flex items-center gap-3 lg:flex-col">
        {shareLinks.map((shareLink) => {
          const Icon = SHARE_ICONS[shareLink.service];
          return (
            <li key={shareLink.service}>
              {/* ツールチップはスマホでは上、PCでは右に出す */}
              <div
                className="tooltip lg:tooltip-right"
                data-tip={shareLink.label}
              >
                <a
                  href={shareLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${shareLink.label}（新しいタブで開く）`}
                  className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-base-200"
                >
                  <Icon aria-hidden="true" className="size-6" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
