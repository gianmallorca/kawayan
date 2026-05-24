import type { MissionVision as MissionVisionType } from '@/lib/pageContent';

type Props = { data: MissionVisionType; large?: boolean };

export function MissionVision({ data, large }: Props) {
  if (!data.mission && !data.vision) return null;
  return (
    <section className="bg-tint py-16 lg:py-20 border-t border-gray-200">
      <div className={`max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-2 ${large ? 'text-lg' : ''}`}>
        {data.mission && (
          <div className="md:border-r md:border-slate-200 md:pr-10">
            <h2 className={`font-bold mb-3 text-primary ${large ? 'text-2xl' : 'text-xl'}`}>Mission</h2>
            <p className="text-gray-700 leading-relaxed">{data.mission}</p>
          </div>
        )}
        {data.vision && (
          <div>
            <h2 className={`font-bold mb-3 text-primary ${large ? 'text-2xl' : 'text-xl'}`}>Vision</h2>
            <p className="text-gray-700 leading-relaxed">{data.vision}</p>
          </div>
        )}
      </div>
    </section>
  );
}
