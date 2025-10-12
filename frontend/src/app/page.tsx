import { IconKeyboard } from '@tabler/icons-react';
import { Github } from 'lucide-react';
import Image from 'next/image';

import { SignIn } from '@/components/common/AuthButton';

export default function Home() {
  return (
    <>
      <section className="bg-background relative flex-1 overflow-hidden">
        <div
          className={`
            absolute inset-0 animate-pulse
            bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
            bg-[size:50px_50px]
          `}
        />

        <div
          className={`
            bg-primary/10 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse
            rounded-full blur-3xl
          `}
        />
        <div
          className={`
            bg-secondary/10 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse
            rounded-full blur-3xl delay-1000
          `}
        />

        <div className="relative z-10 container mx-auto flex min-h-[50vh] items-center justify-center px-6">
          <div className="mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <Image src="/logo.svg" alt="TypingRepo Logo" width={512} height={512} />
              </div>
            </div>
            <h1 className="text-foreground mb-6 text-5xl font-bold">
              Practice Typing Through{' '}
              <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                Real Code
              </span>
            </h1>
            <p className="text-foreground mb-8 text-xl">Import code from GitHub repository and practice typing it.</p>
            <div className="flex justify-center">
              <SignIn provider="github">Sign in with GitHub to Start</SignIn>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background relative py-16">
        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold">How to Use TypingRepo</h2>
            <p className="text-muted-foreground mb-16 text-lg">
              Get started with just 2 simple steps to improve your typing skills.
            </p>
          </div>

          <div
            className={`
              grid gap-8
              md:grid-cols-2
            `}
          >
            <div
              className={`
                group border-border/50 bg-card/50 flex flex-col rounded-sm border p-8 transition-all duration-300
                hover:border-primary/50
              `}
            >
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`
                    bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                    group-hover:bg-primary/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]
                  `}
                >
                  <span className="text-primary text-xl font-bold">1</span>
                </div>
                <div className="flex items-center gap-3">
                  <Github className="text-primary h-8 w-8 flex-shrink-0" />
                  <h3 className="text-foreground text-2xl font-bold">Import GitHub Repository</h3>
                </div>
              </div>
              <p className="text-foreground mb-4">
                Input a GitHub repository URL you want to practice with. Select the extensions you want to type and
                import the source code.
              </p>
              <div className="group relative mt-auto">
                <Image
                  className={`
                    border-border/20 h-64 w-full rounded-sm border object-cover transition-opacity duration-300
                    group-hover:opacity-0
                  `}
                  src="/videos/step1_thumbnail.png"
                  alt="Import GitHub Repository demonstration thumbnail"
                  width={800}
                  height={256}
                />
                <Image
                  className={`
                    border-border/20 absolute inset-0 h-64 w-full rounded-sm border object-cover opacity-0
                    transition-opacity duration-300
                    group-hover:opacity-100
                  `}
                  src="/videos/step1_import-repository.gif"
                  alt="Import GitHub Repository demonstration GIF"
                  width={800}
                  height={256}
                />
              </div>
            </div>

            <div
              className={`
                group border-border/50 bg-card/50 flex flex-col rounded-sm border p-8 transition-all duration-300
                hover:border-secondary/50
              `}
            >
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`
                    bg-secondary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                    group-hover:bg-secondary/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]
                  `}
                >
                  <span className="text-secondary text-xl font-bold">2</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconKeyboard className="text-secondary h-8 w-8 flex-shrink-0" />
                  <h3 className="text-foreground text-2xl font-bold">Start Typing Practice</h3>
                </div>
              </div>
              <p className="text-foreground mb-4">
                Select the file and begin typing. You can track your accuracy and speed in real-time.
              </p>
              <div className="group relative mt-auto">
                <Image
                  className={`
                    border-border/20 h-64 w-full rounded-sm border object-cover transition-opacity duration-300
                    group-hover:opacity-0
                  `}
                  src="/videos/step2_thumbnail.png"
                  alt="Typing practice demonstration thumbnail"
                  width={800}
                  height={256}
                />
                <Image
                  className={`
                    border-border/20 absolute inset-0 h-64 w-full rounded-sm border object-cover opacity-0
                    transition-opacity duration-300
                    group-hover:opacity-100
                  `}
                  src="/videos/step2_typing.gif"
                  alt="Typing practice demonstration GIF"
                  width={800}
                  height={256}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
