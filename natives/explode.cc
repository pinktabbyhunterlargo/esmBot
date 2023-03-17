#include <vips/vips8>

#include "common.h"

using namespace std;
using namespace vips;

char *Explode(string type, string *outType, char *BufferData,
              size_t BufferLength, ArgumentMap Arguments, size_t *DataSize) {
  bool implode = GetArgument<bool>(Arguments, "implode");
  string basePath = GetArgument<string>(Arguments, "basePath");

  VOption *options = VImage::option();

  VImage in =
      VImage::new_from_buffer(
          BufferData, BufferLength, "",
          type == "gif" ? options->set("n", -1)->set("access", "sequential")
                        : options)
          .colourspace(VIPS_INTERPRETATION_sRGB);
  if (!in.has_alpha()) in = in.bandjoin(255);

  int width = in.width();
  int pageHeight = vips_image_get_page_height(in.get_image());
  int nPages = vips_image_get_n_pages(in.get_image());

  string distortPath = basePath + "assets/images/" +
                       (implode ? "linearimplode.png" : "linearexplode.png");
  VImage distort =
      (VImage::new_from_file(distortPath.c_str())
           .resize(width / 500.0, VImage::option()
                                      ->set("vscale", pageHeight / 500.0)
                                      ->set("kernel", VIPS_KERNEL_CUBIC)) /
       65535);

  VImage distortImage = (distort[0] * width).bandjoin(distort[1] * pageHeight);

  vector<VImage> img;
  for (int i = 0; i < nPages; i++) {
    VImage img_frame =
        type == "gif" ? in.crop(0, i * pageHeight, width, pageHeight) : in;
    VImage mapped = img_frame.mapim(distortImage);
    img.push_back(mapped);
  }
  VImage final = VImage::arrayjoin(img, VImage::option()->set("across", 1));
  final.set(VIPS_META_PAGE_HEIGHT, pageHeight);

  void *buf;
  final.write_to_buffer(("." + *outType).c_str(), &buf, DataSize);

  return (char *)buf;
}