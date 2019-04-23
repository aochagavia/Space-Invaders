use std::fs::File;
use std::io::BufReader;

use rodio::{Decoder, Device, Sink, Source};
use rodio::source::Buffered;

pub struct SoundPlayer {
    source: Buffered<Decoder<File>>,
    output_device: Device,
}

impl SoundPlayer {
    pub fn new() -> SoundPlayer {
        let output_device = rodio::default_output_device().expect("Failed to open output device");

        let bg_file = File::open("assets/Catch The Mystery.WAV").expect("Failed to load audio asset");
        let bg_source = rodio::Decoder::new(BufReader::new(bg_file)).expect("Failed to decode audio asset");
        let bg_sink = Sink::new(&output_device);
        bg_sink.append(bg_source.repeat_infinite());
        bg_sink.detach();

        let file = File::open("assets/sms2_noise_2__004.wav").expect("Failed to load audio asset");
        let source = rodio::Decoder::new(file).expect("Failed to decode audio asset").buffered();

        SoundPlayer {
            source,
            output_device,
        }
    }

    pub fn play_input_sound(&mut self) {
        let sink = Sink::new(&self.output_device);
        sink.append(self.source.clone());
        sink.detach();
    }
}
