import os

path = "/Users/tingting/Desktop/experimental-web/img/cam"
prefix = "cam"
suffix = ".png"

counter = 0
for fname in os.listdir(path):
    if fname.endswith(suffix):
        new_fname = prefix + str(counter).zfill(2) + suffix
        os.rename(os.path.join(path, fname), os.path.join(path, new_fname))
        counter+=1
