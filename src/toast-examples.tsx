import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Button, Toaster, createToaster } from '@revolist/ui/preact';
import { Example } from './catalog';

export function ToastExamples() {
  const [toaster] = useState(createToaster);
  const [viewport] = useState(createToaster);

  return (
    <>
      <Example title="Toast notifications" wide>
        <p class="toast-example-description">
          Each notification has its own duration. Hover or focus the stack to
          pause it.
        </p>
        <div class="catalog-row">
          <Button
            onClick={() => {
              toaster.show({ title: 'First notification', duration: 2000 });
              toaster.show({ title: 'Second notification', duration: 4000 });
              toaster.show({ title: 'Third notification', duration: 6000 });
            }}
          >
            Timed stack
          </Button>
          <Button onClick={() => toaster.show({ title: 'Settings updated' })}>
            Default
          </Button>
          <Button
            onClick={() =>
              toaster.show({
                title: 'Draft saved',
                description: 'Your changes are synced.',
                tone: 'success',
              })
            }
          >
            Success
          </Button>
          <Button
            onClick={() =>
              toaster.show({
                title: 'Report ready',
                description: 'The weekly summary is available.',
                tone: 'info',
              })
            }
          >
            Info
          </Button>
          <Button
            onClick={() =>
              toaster.show({ title: 'Storage nearly full', tone: 'warning' })
            }
          >
            Warning
          </Button>
          <Button
            onClick={() =>
              toaster.show({
                title: 'Upload failed',
                description: 'Check your connection and try again.',
                tone: 'error',
              })
            }
          >
            Error
          </Button>
          <Button
            onClick={() => {
              void toaster.promise(
                new Promise<string>((resolve) => {
                  setTimeout(() => resolve('Orders.csv'), 1200);
                }),
                {
                  loading: { title: 'Exporting orders…' },
                  success: (file) => ({
                    title: 'Export ready',
                    description: file,
                  }),
                  error: { title: 'Export failed' },
                },
              );
            }}
          >
            Export orders
          </Button>
        </div>
        <Toaster
          toaster={toaster}
          position="inline"
          text={{ notifications: 'Toast examples' }}
        />
      </Example>
      <Example title="Notification with an action">
        <Button
          onClick={() =>
            viewport.show({
              title: 'Draft archived',
              description: 'Find it again in your archive.',
              action: {
                label: 'Undo',
                onClick: () =>
                  viewport.show({ title: 'Draft restored', tone: 'success' }),
              },
            })
          }
        >
          Archive draft
        </Button>
        <Toaster
          toaster={viewport}
          text={{ notifications: 'Archive notifications' }}
        />
      </Example>
    </>
  );
}

export function ToasterThemeSample(
  props: Pick<Parameters<typeof Toaster>[0], 'preset'>,
) {
  const [toaster] = useState(() => {
    const controller = createToaster();
    controller.show({
      title: 'Draft saved',
      description: 'Your changes are synced.',
      tone: 'success',
      duration: 0,
    });
    return controller;
  });
  return <Toaster {...props} toaster={toaster} position="inline" />;
}
